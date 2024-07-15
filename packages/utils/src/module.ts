import { fileURLToPath } from 'node:url';
import { createRequire, Module } from 'node:module';
import { existsSync } from 'node:fs';
import { addPath as addNodeModulePath } from 'app-module-path';
import { dirname, resolve as pathResolve, join as pathJoin } from 'node:path';

let initialized = false;

const thisDir = pathResolve(
  import.meta.url
    ? dirname(fileURLToPath(import.meta.url))
    : typeof __dirname !== 'undefined'
      ? __dirname
      : process.cwd(),
);

export const dynamicRequire = {
  initialize() {
    if (initialized) {
      return;
    }
    initialized = true;

    // Register node_modules paths

    let currentDir = thisDir;
    while (currentDir) {
      if (currentDir.endsWith('node_modules')) {
        tryAddNodeModulePath(currentDir);
        break;
      }
      tryAddNodeModulePath(pathJoin(currentDir, 'node_modules'));
      let parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }

    // Add typescript support by loading tsx
    try {
      dynamicRequire.require('tsx/cjs', import.meta);
    } catch {
      // ignore error if tsx could not be loaded
    }

    // Register .cjs and .cts extensions

    const exts = (Module as any)._extensions;
    if (exts && !('.cjs' in exts)) {
      exts['.cjs'] = exts['.js'];
    }
    if (exts && !('.cts' in exts) && '.ts' in exts) {
      exts['.cts'] = exts['.ts'];
    }
  },

  resolve(path: string, meta: ImportMeta): string {
    dynamicRequire.initialize();
    return createRequire(meta.url || pathResolve(thisDir, 'index.js')).resolve(path);
  },

  require<T = unknown>(path: string, meta: ImportMeta): T {
    dynamicRequire.initialize();
    return createRequire(meta.url || pathResolve(thisDir, 'index.js'))(path);
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

function tryAddNodeModulePath(nodeModulesPath: string) {
  try {
    if (existsSync(nodeModulesPath)) {
      addNodeModulePath(nodeModulesPath);
    }
  } catch {
    // ignore error
  }
}
