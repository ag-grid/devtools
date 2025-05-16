import { expect, test } from 'vitest';
import { cli } from '../../../cli';
import { CliE2ETestEnv } from '../e2e-test-utils';

const env = new CliE2ETestEnv(import.meta.url);

test(
  'cli e2e - gitignore uncommitted error',
  async () => {
    let error: any;
    try {
      await env.init({ gitInit: true });

      await env.writeTempSrc('uncommitted.js', `// uncommitted`);
      await env.addGitFile('uncommitted.js');

      await cli(['migrate', '--non-interactive', '--from=30.0.0'], env.cliOptions);
    } catch (e) {
      error = e as Error;
    } finally {
      await env.removeGitFolder();
    }

    expect(error).instanceOf(Error);
    expect(error.message).toMatch('Uncommitted changes');
    expect(error.info).toMatch('uncommitted.js');
    expect(error.info).not.toMatch('ignored.js');
  },
  env.TIMEOUT,
);
