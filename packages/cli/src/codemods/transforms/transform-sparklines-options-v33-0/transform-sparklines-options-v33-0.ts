import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { columnToVerticalBarTransform } from './transformers/sparkline-column';
import { jsCodeShiftTransform } from './jscodeshift.adapter';
import { processImports } from './transformers/sparkline-imports';
import { replaceTypes } from './transformers/sparkline-types';
import { removeCrosshairs } from './transformers/sparkline-crosshairs';

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return jsCodeShiftTransform(
    columnToVerticalBarTransform,
    removeCrosshairs,
    processImports,
    replaceTypes,
  );
};

export default transform;
