import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../codemods/vite.config.mts';

import pkg from '../codemods/package.json' assert { type: 'json' };

export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: {
        prettier: 'prettier/index.mjs',
      },
    },
    build: {
      outDir: resolve(__dirname, 'dist', 'node_modules', pkg.name),
      sourcemap: false,
    },
  }),
);
