import j, { Collection } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import { CellSelectionModule, RangeSelectionModule } from './constants';
import { addNewIdentifierNextToGiven, addNewImportNextToGiven } from './sharedUtils';

// Find old named imports and replace them with the new named import
export const updateDeprecatedModules: JSCodeShiftTransformer = (root) => {
  swapRangeSelectionForCellSelectionModule(root);
  swapMenuModuleForColumnAndContextModule(root);

  return root.toSource();
};

function swapRangeSelectionForCellSelectionModule(root: Collection) {
  root.find(j.Identifier, { name: RangeSelectionModule }).forEach((path) => {
    // replace RangeSelectionModule with CellSelectionModule
    path.replace(j.identifier(CellSelectionModule));
  });
}

// replace MenuModule with ColumnMenuModule and ContextMenuModule
function swapMenuModuleForColumnAndContextModule(root: Collection) {
  root.find(j.Identifier, { name: 'MenuModule' }).forEach((path) => {
    // replace MenuModule with ColumnMenuModule
    path.replace(j.identifier('ColumnMenuModule'));
  });
  // add ContextMenuModule next to ColumnMenuModule
  addNewImportNextToGiven(root, 'ColumnMenuModule', 'ContextMenuModule');
  addNewIdentifierNextToGiven(root, 'ColumnMenuModule', 'ContextMenuModule');
}
