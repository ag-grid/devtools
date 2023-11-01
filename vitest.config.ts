/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vite';

import base from './packages/build-config/templates/vite/base.vite.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['lcovonly', 'text'],
      },
    },
  }),
);
