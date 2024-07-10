import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - user config multi thread',
  async () => {
    await env.init();
    await cli(
      [
        'migrate',
        '--num-threads=4',
        '--allow-untracked',
        '--from=30.0.0',
        '--config=../user-config.cts',
      ],
      env.cliOptions,
    );
    expect(await env.loadExpectedSrc('custom-imports1.js')).toEqual(
      await env.loadTempSrc('custom-imports1.js'),
    );
    expect(await env.loadExpectedSrc('custom-imports2.js')).toEqual(
      await env.loadTempSrc('custom-imports2.js'),
    );
    expect(await env.loadExpectedSrc('custom-imports2.js')).toEqual(
      await env.loadTempSrc('custom-imports3.js'),
    );
  },
  env.TIMEOUT,
);
