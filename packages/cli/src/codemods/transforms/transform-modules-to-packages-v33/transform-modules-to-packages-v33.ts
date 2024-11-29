import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from '../../plugins/jscodeshift';
import { combinedTransform } from './transformers/combined-transform';

const transform: AstTransform<AstCliContext> = function transformModulesToPackagesV33(babel) {
  return jsCodeShiftTransform(combinedTransform)(babel);
};

export default transform;
