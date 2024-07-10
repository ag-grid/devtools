import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - gitignore simple',
  async () => {
    await env.init();
    await cli(['migrate', '--allow-untracked', '--from=30.0.0'], env.cliOptions);

    // changed files

    expect(await env.loadExpectedSrc('folder/file.js')).toEqual(
      await env.loadTempSrc('folder/file.js'),
    );

    // unchanged files

    expect(await env.loadInputSrc('gitignored.js')).toEqual(await env.loadTempSrc('gitignored.js'));
    expect(await env.loadInputSrc('gitignored/file.js')).toEqual(
      await env.loadTempSrc('gitignored/file.js'),
    );
  },
  env.TIMEOUT,
);
