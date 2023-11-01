declare module 'rollup-plugin-preserve-shebang' {
  import type { Plugin } from 'vite';
  export default function shebang(options?: { shebang?: string }): Plugin;
}
