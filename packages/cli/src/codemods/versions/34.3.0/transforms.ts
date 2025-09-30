import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridOptionsV34_3 from '../../transforms/transform-grid-options-v34-3';

const transforms: Array<AstTransform<AstCliContext>> = [transformGridOptionsV34_3];

export default transforms;
