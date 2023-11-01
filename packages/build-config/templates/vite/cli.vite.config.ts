import './rollup-plugin-preserve-shebang/index.d.ts';
import shebang from 'rollup-plugin-preserve-shebang';
import { defineConfig, mergeConfig } from 'vite';

import base from './node.vite.config';

export default mergeConfig(
  base,
  defineConfig({
    plugins: [shebang()],
  }),
);
