/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';

import base from './vite.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      root: resolve(__dirname, '..', '..'),
    },
  }),
);
