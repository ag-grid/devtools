import { beforeAll, expect, describe, test } from 'vitest';
import { cli } from '../cli';

import {
  TEMP_FOLDER,
  loadExpectedSource,
  loadInputSource,
  loadTempSource,
  patchDynamicRequire,
  prepareTestDataFiles,
} from './test-utils';
import { CliOptions } from '../types/cli';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { findGitRoot } from '../utils/fs';

describe(
  'cli e2e',
  () => {
    beforeAll(() => {
      patchDynamicRequire();
    });

    const cliOptions: CliOptions = {
      topmostGitRoot: TEMP_FOLDER,
      cwd: TEMP_FOLDER,
      env: {
        cwd: TEMP_FOLDER,
      },
      stdio: {
        stdin: process.stdin,
        stdout: process.stdout,
        stderr: process.stderr,
      },
    };

    test('findGitRoot', async () => {
      expect(await findGitRoot(TEMP_FOLDER, undefined)).toEqual(
        resolve(TEMP_FOLDER, '../../../../../'),
      );
      expect(await findGitRoot(resolve(TEMP_FOLDER, 'xxx/yyy'), TEMP_FOLDER)).toEqual(TEMP_FOLDER);
    });

    test('plain cli single threaded', async () => {
      await prepareTestDataFiles();
      await cli(['migrate', '--num-threads=0', '--allow-untracked', '--from=30.0.0'], cliOptions);
      expect(await loadExpectedSource('plain.js')).toEqual(await loadTempSource('plain.js'));

      // Test .gitignore support
      expect(await loadInputSource('gitignored.js')).toEqual(await loadTempSource('gitignored.js'));
      expect(await loadInputSource('gitignored-folder/file.js')).toEqual(
        await loadTempSource('gitignored-folder/file.js'),
      );
    });

    test('plain cli multi-threaded', async () => {
      await prepareTestDataFiles();
      await cli(['migrate', '--num-threads=4', '--allow-untracked', '--from=30.0.0'], cliOptions);
      expect(await loadExpectedSource('plain.js')).toEqual(await loadTempSource('plain.js'));

      // Test .gitignore support
      expect(await loadInputSource('gitignored.js')).toEqual(await loadTempSource('gitignored.js'));
      expect(await loadInputSource('gitignored-folder/file.js')).toEqual(
        await loadTempSource('gitignored-folder/file.js'),
      );
    });

    test('userConfig single-threaded', async () => {
      await prepareTestDataFiles();

      await cli(
        [
          'migrate',
          '--num-threads=0',
          '--allow-untracked',
          '--from=30.0.0',
          '--config=../user-config.cts',
        ],
        cliOptions,
      );

      expect(await loadExpectedSource('custom-imports.js')).toEqual(
        await loadTempSource('custom-imports.js'),
      );
    });

    test('userConfig multi-threaded', async () => {
      await prepareTestDataFiles();

      await cli(
        [
          'migrate',
          '--num-threads=2',
          '--allow-untracked',
          '--from=30.0.0',
          '--config=../user-config.cts',
        ],
        cliOptions,
      );

      expect(await loadExpectedSource('custom-imports.js')).toEqual(
        await loadTempSource('custom-imports.js'),
      );
    });
  },
  { timeout: 20000 },
);
