import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV33_0 from '../../transforms/transform-grid-api-methods-v33-0';

import transformSparklinesOptionsV33_0 from '../../transforms/transform-sparklines-options-v33-0';

import transformModulesToPackagesV33 from '../../transforms/transform-modules-to-packages-v33';

const transforms: Array<AstTransform<AstCliContext>> = [
  transformGridApiMethodsV33_0,
  transformSparklinesOptionsV33_0,
  transformModulesToPackagesV33,
];

export default transforms;
