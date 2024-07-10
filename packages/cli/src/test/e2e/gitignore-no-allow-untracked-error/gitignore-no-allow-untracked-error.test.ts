import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - gitignore no allow untracked error',
  async () => {
    let error: any;
    try {
      await env.init({ gitInit: true });

      await env.writeTempSrc('untracked.js', '// untracked');

      await cli(['migrate', '--from=30.0.0'], env.cliOptions);
    } catch (e) {
      error = e as Error;
    } finally {
      await env.removeGitFolder();
    }

    expect(error).instanceOf(Error);
    expect(error.message).toMatch('Untracked input files');
    expect(error.info).toMatch('untracked.js');
    expect(error.info).not.toMatch('ignored.js');
  },
  env.TIMEOUT,
);
