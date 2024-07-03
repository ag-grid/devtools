import { createRequire } from 'node:module';

export const dynamicRequire = {
  require<T = unknown>(path: string, meta: ImportMeta): T {
    if (meta.url === undefined && typeof require !== undefined) {
      // import.meta not available, maybe running a ts file with tsx? use default cjs require
      return require(path);
    }
    return createRequire(meta.url)(path);
  },

  resolve(path: string, meta: ImportMeta): string {
    if (meta.url === undefined && typeof require !== undefined) {
      // import.meta not available, maybe running a ts file with tsx? use default cjs require
      return require.resolve(path);
    }
    return createRequire(meta.url).resolve(path);
  },
};
