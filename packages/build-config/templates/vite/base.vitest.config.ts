import { defineConfig, configDefaults, mergeConfig } from 'vitest/config';
import baseConfig from './base.vite.config';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      coverage: {
        exclude: [...(configDefaults.coverage.exclude || []), '**/__fixtures__/**', '**/<%=*'],
      },
    },
  }),
);
