import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import { transformGridOptions } from '../../plugins/<%= plugin %>';
import { replacements } from './replacements';

const plugin: AstTransform<AstCliContext> = transformGridOptions(replacements);

const transform: AstTransform<AstCliContext> = function <%= identifier %>(babel) {
  return plugin(babel);
};

export default transform;
