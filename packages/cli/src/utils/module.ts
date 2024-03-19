import { createRequire } from 'node:module';

export function requireDynamicModule<T = unknown>(path: string, meta: ImportMeta): T {
  const require = createRequire(meta.url);
  return require(path);
}

export function resolveDynamicModule(path: string, meta: ImportMeta): string {
  const require = createRequire(meta.url);
  return require.resolve(path);
}
