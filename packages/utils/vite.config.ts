import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/lib.vite.config';

import pkg from './package.json';

export default mergeConfig(
  base,
  defineConfig({
    build: {
      lib: {
        entry: resolve(__dirname, pkg.module),
        name: pkg.name,
        formats: ['es', 'cjs'],
        fileName: 'lib/lib',
      },
    },
  }),
);
