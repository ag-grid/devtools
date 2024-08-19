import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import base from '../build-config/templates/vite/cli.vite.config';

import pkg from './package.json' assert { type: 'json' };

const CODEMODS_VERSIONS_PATH = 'src/codemods/versions';
const CODEMOD_FILENAME = 'codemod.ts';

const versions = readdirSync(resolve(__dirname, CODEMODS_VERSIONS_PATH))
  .map((filename) => ({
    name: filename,
    path: resolve(__dirname, CODEMODS_VERSIONS_PATH, filename),
  }))
  .filter(({ path }) => statSync(path).isDirectory());

const codemodEntries = Object.fromEntries(
  versions
    .filter(({ path }) => statSync(resolve(path, CODEMOD_FILENAME)).isFile())
    .map(({ name, path }) => [
      `codemods/versions/${name}/codemod`,
      resolve(path, CODEMOD_FILENAME),
    ]),
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
          index: resolve(__dirname, pkg.main),
          'ag-grid-devtools-cli': resolve(__dirname, 'ag-grid-devtools-cli.ts'),
          'user-config': resolve(__dirname, 'user-config.ts'),
          'codemods/lib': resolve(__dirname, 'src/codemods/lib.ts'),
          'codemods/worker': resolve(__dirname, 'src/codemods/worker.ts'),
          ...codemodEntries,
        },
        name: pkg.name,
        formats: ['cjs'],
      },
      sourcemap: false,
      rollupOptions: {
        external: ['@typescript-eslint/parser'],
      },
    },
    plugins: [
      dts({
        rollupTypes: true,
        bundledPackages: ['@ag-grid-devtools/types'],
        exclude: [
          'src/codemods/**',
          'node_modules/**',
          '*.config.mts',
          '**/*.test.ts',
          'package.json',
          'index.ts',
        ],
      }),
      viteStaticCopy({
        targets: [
          { src: 'index.mjs', dest: '.' },
          { src: 'ag-grid-devtools-cli.mjs', dest: '.' },
        ],
      }),
    ],
  }),
);
