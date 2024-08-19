import { join, resolve } from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';

import base from './vite.config.mts';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      root: resolve(__dirname, '..', '..'),
      include: [join(__dirname, '**/*.{test,spec}.?(c|m)[jt]s?(x)')],
    },
  }),
);
