import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from '../../plugins/jscodeshift';
import { processImports } from './transformers/module-imports';

const transform: AstTransform<AstCliContext> = function transformModulesToPackagesV33(babel) {
  return jsCodeShiftTransform(processImports)(babel);
};

export default transform;
