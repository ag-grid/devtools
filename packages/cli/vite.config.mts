import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { viteStaticCopy } from 'vite-plugin-static-copy';

import base from '../build-config/templates/vite/cli.vite.config';

import pkg from './package.json' assert { type: 'json' };

export default mergeConfig(
  base,
  defineConfig({
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, pkg.main),
          'user-config': resolve(__dirname, 'user-config.ts'),
        },
        name: pkg.name,
        formats: ['cjs'],
      },
      sourcemap: false,
      rollupOptions: {
        external: ['@ag-grid-devtools/codemods'],
      },
    },
    plugins: [
      dts({
        rollupTypes: true,
        bundledPackages: ['@ag-grid-devtools/types'],
        exclude: ['node_modules/**', '*.config.mts', '**/*.test.ts', 'package.json', 'index.ts'],
      }),
      viteStaticCopy({
        targets: [
          { src: 'index.mjs', dest: '.' },
          { src: 'user-config.mjs', dest: '.' },
        ],
      }),
    ],
  }),
);
