import { BabelPlugin, BabelPluginWithOptions, ParserOptions } from '@ag-grid-devtools/ast';
import {
  loadAstTransformExampleScenarios,
  type ExampleVitestHelpers,
} from '@ag-grid-devtools/test-utils';
import { applyBabelTransform } from '../../babelHelpers';

export interface BabelTransformExampleScenarioOptions {
  jsx?: boolean;
  sourceType?: ParserOptions['sourceType'];
}

export function loadBabelTransformExampleScenarios<S, T extends object = object>(
  scenariosPath: string,
  options: {
    plugins: Array<BabelPlugin<S> | BabelPluginWithOptions<S, T>>;
    vitest: ExampleVitestHelpers;
  },
) {
  const { plugins, vitest } = options;
  loadAstTransformExampleScenarios<BabelTransformExampleScenarioOptions>(scenariosPath, {
    runner: (input) => {
      const source = applyBabelTransform(input.source, plugins, {
        filename: input.path,
        jsx: input.options?.jsx ?? false,
        sourceType: input.options?.sourceType ?? 'module',
      });
      return { source, errors: [], warnings: [] };
    },
    vitest,
  });
}
