/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { configDefaults } from 'vitest/config';

export default defineConfig({
  build: {
    sourcemap: true,
  },
  test: {
    coverage: {
      exclude: [...(configDefaults.coverage.exclude || []), '**/__fixtures__/**'],
    },
  },
});
