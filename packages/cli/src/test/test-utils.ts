import { readFile, cp, mkdir, rmdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { dynamicRequire } from '@ag-grid-devtools/utils';
import { cli } from '../cli';
import prettier from 'prettier';

export const ROOT_FOLDER = path.dirname(fileURLToPath(import.meta.url));
export const TEMP_FOLDER = path.resolve(ROOT_FOLDER, '_temp');
export const INPUT_FOLDER = path.resolve(ROOT_FOLDER, 'input-files');
export const EXPECTED_FOLDER = path.resolve(ROOT_FOLDER, 'expected');

export async function loadExpectedSource(name: string) {
  const filepath = path.resolve(EXPECTED_FOLDER, name);
  return prettier.format(await readFile(filepath, 'utf-8'), { filepath });
}

export async function loadTempSource(name: string) {
  const filepath = path.resolve(TEMP_FOLDER, name);
  return prettier.format(await readFile(filepath, 'utf-8'), { filepath });
}

export async function prepareTestDataFiles() {
  try {
    await rmdir(TEMP_FOLDER, { recursive: true });
  } catch {
    // already deleted
  }

  await mkdir(TEMP_FOLDER, { recursive: true });

  await cp(path.resolve(ROOT_FOLDER, INPUT_FOLDER), TEMP_FOLDER, {
    recursive: true,
    force: true,
    filter: (src) => !src.includes('README.md'),
  });
}

export function patchDynamicRequire() {
  /** Fixes the path of an import for typescript, as we are using those with worker threads */
  const fixPath = (p: string): string => {
    if (p === '@ag-grid-devtools/codemods/worker') {
      return '@ag-grid-devtools/codemods/src/worker.ts';
    }

    if (p.startsWith('@ag-grid-devtools/codemods/version/')) {
      p =
        '@ag-grid-devtools/codemods/src/versions/' +
        p.slice('@ag-grid-devtools/codemods/version/'.length) +
        '/codemod.ts';
    }

    return p;
  };

  const oldRequire = dynamicRequire.require;
  dynamicRequire.require = (path: string, meta: ImportMeta) => oldRequire(fixPath(path), meta);

  const oldResolve = dynamicRequire.resolve;
  dynamicRequire.resolve = (path: string, meta: ImportMeta) => oldResolve(fixPath(path), meta);
}
