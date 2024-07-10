import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vite';
import dts from 'vite-plugin-dts';
<<<<<<< HEAD
import { viteStaticCopy } from 'vite-plugin-static-copy';
=======
>>>>>>> a3ea8da (Publish 32.0.2 (#61))

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
<<<<<<< HEAD
      viteStaticCopy({
        targets: [
          { src: 'index.mjs', dest: '.' },
          { src: 'user-config.mjs', dest: '.' },
        ],
      }),
=======
>>>>>>> a3ea8da (Publish 32.0.2 (#61))
    ],
  }),
);
