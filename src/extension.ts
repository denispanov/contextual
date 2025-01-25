import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import ignore from 'ignore';
import { get_encoding } from 'tiktoken';
import { getIgnorePatterns, processDirectoryWithExplicitPaths } from './ignore';
import { processFile } from './fileProcessor';

async function getGitignore(rootPath: string): Promise<ReturnType<typeof ignore>> {
  const ig = ignore();
  try {
    const gitignorePath = path.join(rootPath, '.gitignore');
    const content = await fs.readFile(gitignorePath, 'utf8');
    ig.add(content);
  } catch {
    // Ignore missing gitignore file
  }
  return ig;
}

function getTokenCount(text: string): number {
  const encoding = get_encoding('cl100k_base');
  try {
    const tokens = encoding.encode(text);
    return tokens.length;
  } finally {
    encoding.free();
  }
}

function formatNumber(num: number): string {
  return num.toLocaleString('en');
}

async function processDirectory(
  dirPath: string,
  ig: ReturnType<typeof ignore>,
  explicitPaths?: Set<string>,
): Promise<string> {
  let result = '';
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(vscode.workspace.workspaceFolders![0].uri.fsPath, fullPath);

    const shouldInclude = explicitPaths?.has(fullPath) || !ig.ignores(relativePath);

    if (!shouldInclude) {
      continue;
    }

    if (entry.isDirectory()) {
      result += await processDirectory(fullPath, ig, explicitPaths);
    } else {
      const content = await processFile(fullPath);
      if (content) {
        result += content;
      }
    }
  }

  return result;
}

async function copyToClipboard(content: string, sourcePath: string): Promise<void> {
  const charCount = content.length;
  const tokenCount = getTokenCount(content);
  await vscode.env.clipboard.writeText(content);
  const displayName = path.basename(sourcePath);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Copied "${displayName}" (${formatNumber(charCount)} characters, ${formatNumber(
        tokenCount,
      )} tokens) to clipboard`,
      cancellable: false,
    },
    async () => {
      return new Promise((resolve) => setTimeout(resolve, 5000));
    },
  );
}

async function handleMultiSelect(uris: vscode.Uri[]): Promise<void> {
  if (!uris.length) {
    const editor = vscode.window.activeTextEditor;
    if (editor?.selection) {
      uris = [editor.document.uri];
    }
  }

  const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!rootPath) return;

  const ig = await getIgnorePatterns(rootPath);
  let combinedContent = '';

  const explicitPaths = new Set(uris.map((uri) => uri.fsPath));

  for (const uri of uris) {
    const isDirectory = await fs.stat(uri.fsPath).then((stat) => stat.isDirectory());
    if (isDirectory) {
      combinedContent += await processDirectoryWithExplicitPaths(uri.fsPath, ig, explicitPaths);
    } else {
      const content = await processFile(uri.fsPath);
      if (content) combinedContent += content;
    }
  }

  await copyToClipboard(combinedContent, 'Selected Items');
}

export function activate(context: vscode.ExtensionContext): void {
  const copyFile = vscode.commands.registerCommand(
    'contextual.copyFileAsContext',
    async (uri: vscode.Uri) => {
      const content = await processFile(uri.fsPath);
      if (content) {
        await copyToClipboard(content, uri.fsPath);
      } else {
        void vscode.window.showWarningMessage('Could not copy file');
      }
    },
  );

  const copyFolder = vscode.commands.registerCommand(
    'contextual.copyFolderAsContext',
    async (uri: vscode.Uri) => {
      const ig = await getGitignore(uri.fsPath);
      const explicitPaths = new Set([uri.fsPath]);
      const content = await processDirectory(uri.fsPath, ig, explicitPaths);
      await copyToClipboard(content, uri.fsPath);
    },
  );

  const copyWorkspace = vscode.commands.registerCommand(
    'contextual.copyWorkspaceAsContext',
    async () => {
      if (!vscode.workspace.workspaceFolders) {
        void vscode.window.showErrorMessage('No workspace folder open');
        return;
      }
      const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
      const ig = await getGitignore(rootPath);
      const content = await processDirectory(rootPath, ig);
      await copyToClipboard(content, rootPath);
    },
  );

  const copySelected = vscode.commands.registerCommand(
    'contextual.copySelectedAsContext',
    async (uri: vscode.Uri, uris: vscode.Uri[]) => {
      const itemsToProcess = uris?.length ? uris : [uri];
      await handleMultiSelect(itemsToProcess);
    },
  );

  context.subscriptions.push(copyFile, copyFolder, copyWorkspace, copySelected);
}
