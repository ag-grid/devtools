import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from './jscodeshift.adapter';
import {
  chartTypeSubobject,
  columnToVerticalBarTransform,
  highlightStyle,
  markerFormatter,
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
    highlightStyle,
    markerFormatter,
  );
};

export default transform;
