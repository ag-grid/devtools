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
import { UserConfig } from '@ag-grid-devtools/types';

export function loadTransformScenarios(
  scenariosPath: string,
  options: {
    transforms: Array<AstTransform<AstCliContext> | AstTransformWithOptions<AstCliContext>>;
    vitest: ExampleVitestHelpers;
    userConfig?: UserConfig;
  },
): void {
  const { transforms, vitest, userConfig } = options;
  return loadAstTransformExampleScenarios(scenariosPath, {
    vitest,
    runner: (input) => {
      const { source, errors, warnings } = transformFileAst(input.source, transforms, {
        filename: input.path,
        fs: createMockFsHelpers(memfs),
        userConfig,
      });
      return { source, errors, warnings };
    },
  });
}
