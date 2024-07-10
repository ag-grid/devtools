import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - gitignore no allow untracked',
  async () => {
    try {
      await env.init({ gitInit: true });
      await cli(['migrate', '--from=30.0.0'], env.cliOptions);
    } finally {
      await env.removeGitFolder();
    }

    // changed files

    expect(await env.loadExpectedSrc('folder/file.js')).toEqual(
      await env.loadTempSrc('folder/file.js'),
    );

    expect(await env.loadExpectedSrc('folder/subfolder/gitignored.js')).toEqual(
      await env.loadTempSrc('folder/subfolder/gitignored.js'),
    );

    // unchanged files

    expect(await env.loadInputSrc('gitignored.js')).toEqual(await env.loadTempSrc('gitignored.js'));

    expect(await env.loadInputSrc('gitignored/file.js')).toEqual(
      await env.loadTempSrc('gitignored/file.js'),
    );

    expect(await env.loadInputSrc('folder/subfolder/ignore-this1.js')).toEqual(
      await env.loadTempSrc('folder/subfolder/ignore-this1.js'),
    );

    expect(await env.loadInputSrc('folder/subfolder/ignore-this2.js')).toEqual(
      await env.loadTempSrc('folder/subfolder/ignore-this2.js'),
    );
  },
  env.TIMEOUT,
);
