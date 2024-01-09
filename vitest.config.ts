/// <reference types="vitest" />
import { globSync } from 'glob';
import { dirname, extname, join, relative } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import { configDefaults } from 'vitest/config';
import workspace from './vitest.workspace';

import base from './packages/build-config/templates/vite/base.vite.config';

export default mergeConfig(
  base,
  defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        reporter: ['lcovonly', 'text'],
        include: getWorkspaceProjects(workspace).flatMap((projectPath) =>
          (configDefaults.coverage.include ?? ['**']).map((pattern) => join(projectPath, pattern)),
        ),
      },
    },
  }),
);

function getWorkspaceProjects(workspacePaths: Array<string>) {
  return workspacePaths.flatMap((project) =>
    globSync(join(__dirname, project))
      .map((projectPath) => (extname(projectPath) ? dirname(projectPath) : projectPath))
      .map((path) => relative(__dirname, path)),
  );
}
