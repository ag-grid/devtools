import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridOptionsV31_2 from '../../transforms/transform-grid-options-v31-2';

const transforms: Array<AstTransform<AstCliContext>> = [transformGridOptionsV31_2];

export default transforms;
