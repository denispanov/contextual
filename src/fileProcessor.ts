import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs'; // Importing fs for Node.js file operations

// Format file content for copying
export function formatFileContent(filePath: string, content: string): string {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  if (!workspaceRoot) {
    return `${filePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
  }
  const relativePath = path.relative(workspaceRoot, filePath);
  return `/${relativePath}\n\`\`\`\n${content}\n\`\`\`\n\n`;
}

// Process a single file using Node.js file API
export async function processFile(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8'); // Using Node.js fs to read file content
    return formatFileContent(filePath, content);
  } catch {
    return null; // Return null if there's an error reading the file
  }
}
