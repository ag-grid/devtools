import { defineConfig, mergeConfig } from 'vite';

import base from './base.vite.config';

const NODE_MODULES = [
  'assert',
  'async_hooks',
  'buffer',
  'child_process',
  'constants',
  'crypto',
  'events',
  'fs',
  'fs/promises',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'stream',
  'tty',
  'url',
  'util',
  'v8',
];

export default mergeConfig(
  base,
  defineConfig({
    build: {
      rollupOptions: {
        external: [...NODE_MODULES, /^node:/, '@typescript-eslint/parser'],
      },
    },
  }),
);
