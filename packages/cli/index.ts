#!/usr/bin/env node
import { cli, CliError } from './src/cli';

cli(process.argv.slice(2), {
  cwd: process.cwd(),
  env: process.env,
  stdio: {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr,
  },
}).catch((error) => {
  if (error) {
    if (error instanceof CliError) {
      process.stderr.write(`${error.toString(process.env)}\n`, () => {
        process.exit(1);
      });
    } else if (error instanceof Error) {
      throw error;
    } else {
      process.stderr.write(`${String(error)}\n`, () => {
        process.exit(1);
      });
    }
  } else {
    process.exit(1);
  }
});
