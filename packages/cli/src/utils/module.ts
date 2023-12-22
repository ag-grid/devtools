import { createRequire } from 'node:module';

export function requireDynamicModule(path: string, meta: ImportMeta): unknown {
  const require = createRequire(meta.url);
  return require(path);
}

export function resolveDynamicModule(path: string, meta: ImportMeta): string {
  const require = createRequire(meta.url);
  return require.resolve(path);
}
