/// <reference types="vitest" />
import { join, resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';
import { configDefaults } from 'vitest/config';

import base from './vite.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      root: resolve(__dirname, '..', '..'),
      include: [join(__dirname, '**/*.{test,spec}.?(c|m)[jt]s?(x)')],
      exclude: [...configDefaults.exclude, join(__dirname, 'templates')],
      passWithNoTests: true,
    },
  }),
);
