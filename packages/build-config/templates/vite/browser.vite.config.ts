import { defineConfig, mergeConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import base from './base.vite.config';

export default mergeConfig(
  base,
  defineConfig({
    plugins: [nodePolyfills()],
  }),
);
