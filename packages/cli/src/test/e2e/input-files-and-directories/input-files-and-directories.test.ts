import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - input files and directories',
  async () => {
    await env.init();
    await cli(
      ['migrate', '--num-threads=3', '--allow-untracked', '--from=30.0.0', 'file1.js', 'dir'],
      env.cliOptions,
    );
    expect(await env.loadExpectedSrc('file1.js')).toEqual(await env.loadTempSrc('file1.js'));

    expect(await env.loadExpectedSrc('dir/file2.js')).toEqual(
      await env.loadTempSrc('dir/file2.js'),
    );

    expect(await env.loadExpectedSrc('dir/file3.js')).toEqual(
      await env.loadTempSrc('dir/file3.js'),
    );

    expect(await env.loadInputSrc('untouched.js')).toEqual(await env.loadTempSrc('untouched.js'));
  },
  env.TIMEOUT,
);
