import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridOptionsV32_0 from '../../transforms/transform-grid-options-v32-0';

import transformGridApiMethodsV32_0 from '../../transforms/transform-grid-api-methods-v32-0';

const transforms: Array<AstTransform<AstCliContext>> = [
  transformGridOptionsV32_0,
  transformGridApiMethodsV32_0,
];

export default transforms;
