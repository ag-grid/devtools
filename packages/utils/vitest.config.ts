/// <reference types="vitest" />
import { join, resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from './vite.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      root: resolve(__dirname, '..', '..'),
      include: [join(__dirname, '**/*.{test,spec}.?(c|m)[jt]s?(x)')],
    },
  }),
);
