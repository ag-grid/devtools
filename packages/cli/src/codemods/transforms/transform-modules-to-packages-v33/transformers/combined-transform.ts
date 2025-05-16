import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import { addAllCommunityModule } from './add-all-bundle';
import { chartImports } from './chart-imports';
import { communityNpmPackage } from './constants';
import { updateDeprecatedModules } from './deprecated-modules';
import { packageLicenseManager, removeEmptyPackageImports } from './package-transforms';
import { registerModule } from './register-module';
import { isUsingEnterpriseNpmPackage, isUsingNpmPackage } from './sharedUtils';
import { updateImportPaths } from './update-import-paths';
import { updateStyles } from './update-styles';

// Find old named imports and replace them with the new named import
export const combinedTransform: JSCodeShiftTransformer = (root) => {
  if (isUsingEnterpriseNpmPackage(root) || isUsingNpmPackage(root, communityNpmPackage)) {
    // legacy package codebase
    removeEmptyPackageImports(root);
    packageLicenseManager(root);
  } else {
    // already using modules
    registerModule(root);
    updateStyles(root);
    addAllCommunityModule(root);
    chartImports(root);
    updateImportPaths(root);
    updateDeprecatedModules(root);
  }
};
