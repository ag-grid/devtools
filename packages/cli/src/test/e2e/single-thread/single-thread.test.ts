import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - single thread',
  async () => {
    await env.init();
    await cli(
      ['migrate', '--non-interactive', '--num-threads=0', '--allow-untracked', '--from=30.0.0'],
      env.cliOptions,
    );
    expect(await env.loadExpectedSrc('file.js')).toEqual(await env.loadTempSrc('file.js'));
  },
  env.TIMEOUT,
);
