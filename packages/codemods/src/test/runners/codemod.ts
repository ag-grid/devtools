import {
  createMockFsHelpers,
  loadAstTransformExampleScenarios,
  memfs,
  type ExampleVitestHelpers,
} from '@ag-grid-devtools/test-utils';
import { type Codemod } from '@ag-grid-devtools/types';

export function loadCodemodExampleScenarios(
  scenariosPath: string,
  options: {
    codemod: Codemod;
    vitest: ExampleVitestHelpers;
    allowedImports?: string[];
  },
): void {
  const { codemod, vitest, allowedImports } = options;
  return loadAstTransformExampleScenarios(scenariosPath, {
    vitest,
    runner: (input) => {
      const { source, errors, warnings } = codemod(
        { path: input.path, source: input.source },
        { fs: createMockFsHelpers(memfs), allowedImports },
      );
      return { source, errors, warnings };
    },
  });
}
