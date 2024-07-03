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

  test('allowedImports', async () => {
    await prepareTestDataFiles();

    await cli(
      [
        'migrate',
        '--num-threads=1',
        '--allow-untracked',
        '--from=30.0.0',
        '--allowed-imports=@hello/world',
      ],
      {
        cwd: TEMP_FOLDER,
        env: {},
        stdio: {
          stdin: process.stdin,
          stdout: process.stdout,
          stderr: process.stderr,
        },
      },
    );

    expect(await loadExpectedSource('allowed-imports.js')).toEqual(
      await loadTempSource('allowed-imports.js'),
    );
  });
});
