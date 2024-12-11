import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';
import {
  chartTypeSubobject,
  columnToVerticalBarTransform,
  highlightStyle,
  markerFormatter,
  removeCrosshairs,
  replaceTypes,
} from './transformers';
import { jsCodeShiftTransform, multiTypeImportToSingle } from '../../plugins/jscodeshift';
import { newImport, oldImports } from './transformers/constants';

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  const newPackage =
    process.env.AG_USING_CHARTS === 'enterprise' ? 'ag-charts-enterprise' : 'ag-charts-community';

  const plugin = jsCodeShiftTransform(
    columnToVerticalBarTransform,
    multiTypeImportToSingle('@ag-grid-community/core', oldImports, newPackage, newImport),
    multiTypeImportToSingle('ag-grid-community', oldImports, newPackage, newImport),
    removeCrosshairs,
    replaceTypes,
    chartTypeSubobject,
    highlightStyle,
    markerFormatter,
  );

  return plugin(_babel);
};

export default transform;
