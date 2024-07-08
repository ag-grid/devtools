import { createRequire } from 'node:module';

export const dynamicRequire = {
  resolve(path: string, meta: ImportMeta): string {
    if (meta.url === undefined && typeof require !== undefined) {
      // import.meta not available, maybe running a ts file with tsx? use default cjs require
      return require.resolve(path);
    }
    return createRequire(meta.url).resolve(path);
  },

  require<T = unknown>(path: string, meta: ImportMeta): T {
    if (meta.url === undefined && typeof require !== undefined) {
      // import.meta not available, maybe running a ts file with tsx? use default cjs require
      return require(path);
    }
    return createRequire(meta.url)(path);
  },

  /** Like require, but supports modules with a default export transpiled to cjs */
  requireDefault<T = unknown>(path: string, meta: ImportMeta): T {
    const required = dynamicRequire.require<any>(path, meta);
    if (
      typeof required === 'object' &&
      required !== null &&
      'default' in required &&
      ('__esModule' in required || required[Symbol.toStringTag] === 'Module')
    ) {
      // this is a default export from an esm module transpiled to cjs, return the default export
      return required.default;
    }
    return required;
  },
};
