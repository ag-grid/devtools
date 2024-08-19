import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { transformGridApiMethods } from '../../plugins/transform-grid-api-methods';
import { deprecations, replacements } from './replacements';

const plugin: AstTransform<AstCliContext> = transformGridApiMethods({ replacements, deprecations });

const transform: AstTransform<AstCliContext> = function transformGridApiMethodsV31(babel) {
  return plugin(babel);
};

export default transform;
