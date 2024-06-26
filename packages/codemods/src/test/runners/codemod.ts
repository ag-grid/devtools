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
  },
): void {
  const { codemod, vitest } = options;
  return loadAstTransformExampleScenarios(scenariosPath, {
    vitest,
    runner: (input) => {
      const { source, errors, warnings } = codemod(
        { path: input.path, source: input.source },
        { fs: createMockFsHelpers(memfs) },
      );
      return { source, errors, warnings };
    },
  });
}
