import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/node.vite.config';

import pkg from './package.json' assert { type: 'json' };

const WORKER_PATH = 'src/worker.ts';
const VERSIONS_PATH = 'src/versions';
const CODEMOD_FILENAME = 'codemod.ts';

const versions = readdirSync(join(__dirname, VERSIONS_PATH))
  .map((filename) => ({
    name: filename,
    path: join(__dirname, VERSIONS_PATH, filename),
  }))
  .filter(({ path }) => statSync(path).isDirectory());

const codemodEntries = Object.fromEntries(
  versions
    .filter(({ path }) => statSync(join(path, CODEMOD_FILENAME)).isFile())
    .map(({ name, path }) => [`version/${name}`, join(path, CODEMOD_FILENAME)]),
);

export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: {
        prettier: 'prettier/index.mjs',
      },
    },
    build: {
      lib: {
        entry: {
          'lib/lib': resolve(__dirname, pkg.module),
          worker: resolve(__dirname, WORKER_PATH),
          ...codemodEntries,
        },
        name: pkg.name,
        formats: ['cjs'],
        fileName: '[name]',
      },
    },
  }),
);
