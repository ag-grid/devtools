import { join, relative, resolve, sep } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';

import base from '../build-config/templates/vite/browser.vite.config';

import pkg from './package.json' assert { type: 'json' };

export default mergeConfig(
  base,
  defineConfig({
    build: {
      sourcemap: true,
      lib: {
        entry: resolve(__dirname, pkg.main),
        name: getUmdGlobalIdentifier(pkg.name),
        formats: ['iife'],
        fileName: (format, entryName) => {
          const extension = format === 'iife' ? '.js' : `.${format}.js`;
          return `${entryName}${extension}`;
        },
      },
      rollupOptions: {
        output: {
          sourcemapPathTransform: fixRelativeSourcemapPaths({
            outputDir: join(__dirname, 'dist'),
            projectRoot: __dirname,
          }),
        },
      },
    },
  }),
);

function getUmdGlobalIdentifier(packageName: string): string {
  return (
    packageName
      // Replace preceding npm scope prefix
      .replace(/^@.*?\//, '')
      // Convert dashed case to camel case
      .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
  );
}

function fixRelativeSourcemapPaths(options: {
  outputDir: string;
  projectRoot: string;
}): ((relativePath: string) => string) | undefined {
  // Rollup emits sourcemap paths relative to the 'dist' directory,
  // but we want the paths to be relative to the project root
  const { outputDir, projectRoot } = options;
  if (outputDir === projectRoot) return undefined;
  // Determine the relative path from the output directory to the project root
  const projectPath = `${relative(outputDir, projectRoot)}${sep}`;
  // Strip the project root path prefix from all sourcemap paths
  return (relativePath) => {
    if (relativePath.startsWith(projectPath)) return relativePath.slice(projectPath.length);
    return relativePath;
  };
}
