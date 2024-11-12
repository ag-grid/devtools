import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import transformGridApiMethodsV33_0 from '../../transforms/transform-grid-api-methods-v33-0';

import migrateSparklinesOptions from '../../transforms/migrate-sparklines-options';

const transforms: Array<AstTransform<AstCliContext>> = [
  transformGridApiMethodsV33_0,
  migrateSparklinesOptions,
];

export default transforms;
