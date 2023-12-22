import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../codemods/vite.config';

import pkg from '../codemods/package.json' assert { type: 'json' };

export default mergeConfig(
  base,
  defineConfig({
    build: {
      outDir: resolve(__dirname, 'dist', 'node_modules', pkg.name),
      sourcemap: false,
    },
  }),
);
