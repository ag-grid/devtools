import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - single thread',
  async () => {
    await env.init();
    await cli(['migrate', '--num-threads=0', '--allow-untracked', '--from=30.0.0'], env.cliOptions);
    expect(await env.loadExpectedSrc('file.vue')).toEqual(await env.loadTempSrc('file.vue'));
  },
  env.TIMEOUT,
);
