import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { transformGridOptions } from '../../plugins/transform-grid-options';
import { replacements } from './replacements';

const plugin: AstTransform<AstCliContext> = transformGridOptions(replacements);

const transform: AstTransform<AstCliContext> = function transformGridOptionsV31_2(babel) {
  return plugin(babel);
};

export default transform;
