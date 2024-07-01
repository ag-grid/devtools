import {
  type AstCliContext,
  type AstTransform,
  type AstTransformWithOptions,
} from '@ag-grid-devtools/ast';
import { transformFileAst } from '@ag-grid-devtools/codemod-utils';
import {
  createMockFsHelpers,
  loadAstTransformExampleScenarios,
  memfs,
  type ExampleVitestHelpers,
} from '@ag-grid-devtools/test-utils';

export function loadTransformScenarios(
  scenariosPath: string,
  options: {
    transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>;
    vitest: ExampleVitestHelpers;
    allowedImports?: string[];
  },
): void {
  const { transforms, vitest, allowedImports } = options;
  return loadAstTransformExampleScenarios(scenariosPath, {
    vitest,
    runner: (input) => {
      const { source, errors, warnings } = transformFileAst(input.source, transforms, {
        filename: input.path,
        fs: createMockFsHelpers(memfs),
        allowedImports,
      });
      return { source, errors, warnings };
    },
  });
}
