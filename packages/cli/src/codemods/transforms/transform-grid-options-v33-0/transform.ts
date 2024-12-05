import { type AstCliContext, type AstTransform, type Babel } from '@ag-grid-devtools/ast';
import { jsCodeShiftTransform } from '../../plugins/jscodeshift';
import { transformGroupHideParentOfSingleChild } from './transformers/transformGroupHideParentOfSingleChild';
import { transformSuppressGroupChangesColumnVisibility } from './transformers/transformSuppressGroupChangesColumnVisibility';
import { transformGridOptionToColDef } from './transformers/transformGridOptionToColDef';

const transform: AstTransform<AstCliContext> = (babel: Babel) => {
  return jsCodeShiftTransform(
    transformGroupHideParentOfSingleChild,
    transformSuppressGroupChangesColumnVisibility,
    transformGridOptionToColDef('unSortIcon'),
    transformGridOptionToColDef('sortingOrder'),
  )(babel);
};

export default transform;
