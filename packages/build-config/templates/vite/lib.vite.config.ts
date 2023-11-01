import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';

import base from './node.vite.config';

export default mergeConfig(
  base,
  defineConfig({
    plugins: [
      dts({
        exclude: ['node_modules/**', '*.config.ts', '**/*.test.ts'],
      }),
    ],
  }),
);
