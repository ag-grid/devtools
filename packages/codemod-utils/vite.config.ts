import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/lib.vite.config';

import pkg from './package.json' assert { type: 'json' };

export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: {
        'prettier': 'prettier/index.mjs',
      },
    },
    build: {
      lib: {
        entry: resolve(__dirname, pkg.module),
        name: pkg.name,
        formats: ['es', 'cjs'],
        fileName: 'lib/lib',
      },
      rollupOptions: {
        external: ['vitest', '@vitest/expect', '@vitest/runner'],
      },
    },
  }),
);
