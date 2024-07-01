import { defineConfig, mergeConfig } from 'vitest/config';

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
