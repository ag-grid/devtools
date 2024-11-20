import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { combineVisitors } from './visitor-utils';
import * as transforms from './transformers';

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return {
    visitor: combineVisitors(...Object.values(transforms)),
  };
};

export default transform;
