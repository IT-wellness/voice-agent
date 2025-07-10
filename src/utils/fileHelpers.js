import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

export async function getFileForDownload(filename, baseDir = 'recordings') {
  const fullPath = path.join(__dirname, '../../../', baseDir, filename);
  try {
    await fs.access(fullPath);
    return {
      path: fullPath,
      name: filename,
      size: (await fs.stat(fullPath)).size
    };
  } catch (err) {
    throw new Error(`File not found: ${filename}`);
  }
}