import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import { AllCommunityModule, gridRowModelModules } from './constants';
import { addNewIdentifierNextToGiven, addNewImportNextToGiven } from './sharedUtils';

// Find old named imports and replace them with the new named import
export const addAllCommunityModule: JSCodeShiftTransformer = (root) => {
  gridRowModelModules.forEach((module) => {
    addNewImportNextToGiven(root, module, AllCommunityModule);
    addNewIdentifierNextToGiven(root, module, AllCommunityModule);
  });

  return root.toSource();
};
