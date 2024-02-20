import { createMockFsHelpers, fs as memfs } from '@ag-grid-devtools/test-utils';
import { type Codemod } from '@ag-grid-devtools/types';
import { loadExampleScenarios } from '../scenario';

export function loadCodemodExampleScenarios(
  scenariosPath: string,
  options: {
    codemod: Codemod;
  },
): void {
  const { codemod } = options;
  return loadExampleScenarios(scenariosPath, {
    runner: (input) => {
      const { source, errors } = codemod(
        { path: input.path, source: input.source },
        {
          applyDangerousEdits: input.options.applyDangerousEdits,
          fs: createMockFsHelpers(memfs),
        },
      );
      return { source, errors };
    },
  });
}
