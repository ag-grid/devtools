import { type AstCliContext, type AstTransform, type Babel } from '@ag-grid-devtools/ast';
import { jsCodeShiftTransform } from '../../plugins/jscodeshift';
import { transformGroupHideParentOfSingleChild } from './transformers/transformGroupHideParentOfSingleChild';
import { transformSuppressGroupChangesColumnVisibility } from './transformers/transformSuppressGroupChangesColumnVisibility';

const transform: AstTransform<AstCliContext> = (babel: Babel) => {
  return jsCodeShiftTransform(
    transformGroupHideParentOfSingleChild,
    transformSuppressGroupChangesColumnVisibility,
  )(babel);
};

export default transform;
