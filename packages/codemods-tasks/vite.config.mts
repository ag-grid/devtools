import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/node.vite.config';

import pkg from './package.json' assert { type: 'json' };

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
        },
        name: pkg.name,
        formats: ['cjs'],
        fileName: '[name]',
      },
    },
  }),
);
