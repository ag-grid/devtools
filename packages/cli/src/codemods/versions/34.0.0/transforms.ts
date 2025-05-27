import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV34_0 from '../../transforms/transform-grid-api-methods-v34-0';

const transforms: Array<AstTransform<AstCliContext>> = [transformGridApiMethodsV34_0];

export default transforms;
