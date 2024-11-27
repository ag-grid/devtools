import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from './jscodeshift.adapter';
import { processImports } from './transformers/module-imports';

const transform: AstTransform<AstCliContext> = function transformModulesToPackagesV33(babel) {
  return jsCodeShiftTransform(processImports);
};

export default transform;
