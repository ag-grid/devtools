import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV31_1 from '../../transforms/transform-grid-api-methods-v31-1';

import transformGridOptionsV31_1 from '../../transforms/transform-grid-options-v31-1';

const transforms: Array<AstTransform<AstCliContext>> = [
  transformGridApiMethodsV31_1,
  transformGridOptionsV31_1,
];

export default transforms;
