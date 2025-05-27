export * from './jscodeshift.adapter';

import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import {
  transformAutoSizeColumnsArguments,
  transformAutoSizeAllColumnsArguments,
} from './transforms';
import { jsCodeShiftTransform } from '../../plugins/jscodeshift';

const transform: AstTransform<AstCliContext> = function (_babel) {
  return jsCodeShiftTransform(
    transformAutoSizeColumnsArguments,
    transformAutoSizeAllColumnsArguments,
  )(_babel);
};

export default transform;
