import {
  createMockFsHelpers,
  loadAstTransformExampleScenarios,
  memfs,
  type ExampleVitestHelpers,
} from '@ag-grid-devtools/test-utils';
import { UserConfig, type Codemod } from '@ag-grid-devtools/types';

export function loadCodemodExampleScenarios(
  scenariosPath: string,
  options: {
    codemod: Codemod;
    vitest: ExampleVitestHelpers;
    userConfig?: UserConfig;
  },
): void {
  const { codemod, vitest, userConfig } = options;
  return loadAstTransformExampleScenarios(scenariosPath, {
    vitest,
    runner: (input) => {
      const { source, errors, warnings } = codemod(
        { path: input.path, source: input.source },
        { fs: createMockFsHelpers(memfs), userConfig },
      );
      return { source, errors, warnings };
    },
  });
}
