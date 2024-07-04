import { beforeAll, expect, describe, test } from 'vitest';
import { cli } from '../cli';
import {
  TEMP_FOLDER,
  loadExpectedSource,
  loadTempSource,
  patchDynamicRequire,
  prepareTestDataFiles,
} from './test-utils';

describe('cli e2e', () => {
  beforeAll(() => {
    patchDynamicRequire();
  });

  test('userConfig', async () => {
    await prepareTestDataFiles();

    await cli(
      [
        'migrate',
        '--num-threads=1',
        '--allow-untracked',
        '--from=30.0.0',
        '--user-config=../user-config.ts',
      ],
      {
        cwd: TEMP_FOLDER,
        env: {
          cwd: TEMP_FOLDER,
        },
        stdio: {
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr,
        },
      },
    );

    expect(await loadExpectedSource('custom-imports.js')).toEqual(
      await loadTempSource('custom-imports.js'),
    );
  }, 10000);
});
