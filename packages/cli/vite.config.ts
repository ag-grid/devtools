import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/cli.vite.config';

import pkg from './package.json';

export default mergeConfig(
  base,
  defineConfig({
    build: {
      lib: {
        entry: resolve(__dirname, pkg.main),
        name: pkg.name,
        formats: ['cjs'],
        fileName: 'index',
      },
      sourcemap: false,
    },
  }),
);
