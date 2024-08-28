import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV32_2 from '../../transforms/transform-grid-api-methods-v32-2';

const transforms: Array<AstTransform<AstCliContext>> = [transformGridApiMethodsV32_2];

export default transforms;
