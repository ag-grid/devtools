import { beforeAll, expect, describe, test } from 'vitest';
import { cli } from '../cli';
import {
  TEMP_FOLDER,
  loadExpectedSource,
  loadTempSource,
  patchDynamicRequire,
  prepareTestDataFiles,
} from './test-utils';
import { CliOptions } from '../types/cli';

describe('cli e2e', () => {
  beforeAll(() => {
    patchDynamicRequire();
  });

  const cliOptions: CliOptions = {
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

  test('plain cli single threaded', async () => {
    await prepareTestDataFiles();
    await cli(['migrate', '--num-threads=0', '--allow-untracked', '--from=30.0.0'], cliOptions);
    expect(await loadExpectedSource('plain.js')).toEqual(await loadTempSource('plain.js'));
  }, 10000);

  test('plain cli multi-threaded', async () => {
    await prepareTestDataFiles();
    await cli(['migrate', '--num-threads=0', '--allow-untracked', '--from=30.0.0'], cliOptions);
    expect(await loadExpectedSource('plain.js')).toEqual(await loadTempSource('plain.js'));
  }, 10000);

  test('userConfig single-threaded', async () => {
    await prepareTestDataFiles();

    await cli(
      [
        'migrate',
        '--num-threads=0',
        '--allow-untracked',
        '--from=30.0.0',
        '--user-config=../user-config.ts',
      ],
      cliOptions,
    );

    expect(await loadExpectedSource('custom-imports.js')).toEqual(
      await loadTempSource('custom-imports.js'),
    );
  }, 10000);

  test('userConfig multi-threaded', async () => {
    await prepareTestDataFiles();

    await cli(
      [
        'migrate',
        '--num-threads=2',
        '--allow-untracked',
        '--from=30.0.0',
        '--user-config=../user-config.ts',
      ],
      cliOptions,
    );

    expect(await loadExpectedSource('custom-imports.js')).toEqual(
      await loadTempSource('custom-imports.js'),
    );
  }, 10000);
});
