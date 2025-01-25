import ignore from 'ignore';
import { promises as fs } from 'fs';
import * as path from 'path';
import { processFile } from './fileProcessor';

export async function getIgnorePatterns(rootPath: string): Promise<ReturnType<typeof ignore>> {
  const ig = ignore();

  // Try to read both ignore files
  const files = ['.gitignore', '.contextignore'];

  for (const file of files) {
    try {
      const filePath = path.join(rootPath, file);
      const content = await fs.readFile(filePath, 'utf8');
      ig.add(content);
    } catch {
      // Ignore missing files
    }
  }

  return ig;
}

// New function to process directory with explicit paths that bypass ignore rules
export async function processDirectoryWithExplicitPaths(
  dirPath: string,
  ig: ReturnType<typeof ignore>,
  explicitPaths: Set<string>,
): Promise<string> {
  let result = '';
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath);

    // If path is explicitly selected, include it regardless of ignore rules
    const shouldInclude = explicitPaths.has(fullPath) || !ig.ignores(relativePath);

    if (!shouldInclude) {
      continue;
    }

    if (entry.isDirectory()) {
      result += await processDirectoryWithExplicitPaths(fullPath, ig, explicitPaths);
    } else {
      const content = await processFile(fullPath);
      if (content) {
        result += content;
      }
    }
  }

  return result;
}
