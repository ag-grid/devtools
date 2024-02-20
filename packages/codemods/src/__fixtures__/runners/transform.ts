import {
  type AstCliContext,
  type AstTransform,
  type AstTransformWithOptions,
} from '@ag-grid-devtools/ast';
import { transformFileAst } from '@ag-grid-devtools/codemod-utils';
import { createMockFsHelpers, fs as memfs } from '@ag-grid-devtools/test-utils';
import { loadExampleScenarios } from '../scenario';

export function loadTransformScenarios(
  scenariosPath: string,
  options: {
    transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>;
  },
): void {
  const { transforms } = options;
  return loadExampleScenarios(scenariosPath, {
    runner: (input) => {
      const { source, errors } = transformFileAst(input.source, transforms, {
        filename: input.path,
        applyDangerousEdits: input.options.applyDangerousEdits,
        fs: createMockFsHelpers(memfs),
      });
      return { source, errors };
    },
  });
}
