import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV31_3 from '../../transforms/transform-grid-api-methods-v31-3';

const transforms: Array<AstTransform<AstCliContext>> = [transformGridApiMethodsV31_3];

export default transforms;
