import { globSync } from 'glob';
import { dirname, extname, join, relative } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { configDefaults } from 'vitest/config';
import workspace from './vitest.workspace.mts';

import base from './packages/build-config/templates/vite/base.vitest.config';

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
