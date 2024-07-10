import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - multi thread',
  async () => {
    await env.init();
    await cli(['migrate', '--num-threads=3', '--allow-untracked', '--from=30.0.0'], env.cliOptions);
    expect(await env.loadExpectedSrc('file1.js')).toEqual(await env.loadTempSrc('file1.js'));
    expect(await env.loadExpectedSrc('file2.js')).toEqual(await env.loadTempSrc('file2.js'));
    expect(await env.loadExpectedSrc('file3.js')).toEqual(await env.loadTempSrc('file3.js'));
  },
  env.TIMEOUT,
);
