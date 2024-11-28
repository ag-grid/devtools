import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { jsCodeShiftTransform } from '../../plugins/jscodeshift';
import { addAllCommunityModule } from './transformers/add-all-community';
import { chartImports } from './transformers/chart-imports';
import { updateDeprecatedModules } from './transformers/deprecated-modules';
import { registerModule } from './transformers/register-module';
import { updateImportPaths } from './transformers/update-import-paths';
import { updateStyles } from './transformers/update-styles';

const transform: AstTransform<AstCliContext> = function transformModulesToPackagesV33(babel) {
  return jsCodeShiftTransform(
    registerModule,
    updateStyles,
    chartImports,
    updateImportPaths,
    addAllCommunityModule,
    updateDeprecatedModules,
  )(babel);
};

export default transform;
