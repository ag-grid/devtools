import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from './jscodeshift.adapter';
import {
  chartTypeSubobject,
  columnToVerticalBarTransform,
  processImports,
  removeCrosshairs,
  replaceTypes,
} from './transformers';

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return jsCodeShiftTransform(
    columnToVerticalBarTransform,
    processImports,
    removeCrosshairs,
    replaceTypes,
    chartTypeSubobject,
  );
};

export default transform;
