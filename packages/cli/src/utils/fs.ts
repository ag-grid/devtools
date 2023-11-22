import type { Stats } from 'node:fs';
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';

export { readFile, stat, writeFile } from 'node:fs/promises';

export function isFsErrorCode<T extends string>(
  error: unknown,
  code: T,
): error is Error & { code: T } {
  return error instanceof Error && (error as Error & { code?: string }).code === code;
}

export async function findInDirectory(
  path: string,
  predicate: (path: string, stats: Stats) => boolean,
): Promise<Array<string>> {
  const filenames = await readdir(path);
  return Promise.all(
    filenames.map((filename) =>
      stat(join(path, filename)).then((stats) => {
        const filePath = join(path, filename);
        if (!predicate(filePath, stats)) return [];
        if (!stats.isDirectory()) return [filename];
        return findInDirectory(filePath, predicate).then((children) =>
          children.map((childFilename) => join(filename, childFilename)),
        );
      }),
    ),
  ).then((results) => results.flat());
}

export async function findAncestorDirectoryContaining(
  cwd: string,
  filename: string,
  predicate: (path: string, stats: Stats) => boolean,
): Promise<string | null> {
  const filePath = join(cwd, filename);
  const stats = await (async () => {
    try {
      return await stat(filePath);
    } catch (error) {
      if (isFsErrorCode(error, 'ENOENT')) {
        return null;
      }
      throw error;
    }
  })();
  if (stats) {
    if (!predicate || predicate(filePath, stats)) return cwd;
    return null;
  }
  const { dir: dirname, root } = parse(cwd);
  if (cwd === root) return null;
  return findAncestorDirectoryContaining(dirname, filename, predicate);
}
