#!/usr/bin/env node
const args = process.argv.slice(2);

const [script, ...scriptArgs] = args;

if (!script) {
  process.stderr.write('No script provided\n');
  process.exit(1);
}

import(script)
  .then(({ default: task }) =>
    task(...scriptArgs).then(() => {
      const exitCode = 0;
      return exitCode;
    }),
  )
  .catch((error) => {
    if (error === null || typeof error === 'number') {
      const exitCode = error ?? 1;
      return exitCode;
    }
    throw error;
  })
  .then((exitCode) => process.exit(exitCode));
