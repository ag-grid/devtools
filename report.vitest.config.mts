/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';

import base from './vitest.config.mts';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        reporter: ['html'],
      },
    },
  }),
);
