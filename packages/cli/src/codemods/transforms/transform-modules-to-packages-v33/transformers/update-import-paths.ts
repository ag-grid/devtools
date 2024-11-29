import j, { Collection } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  angularNpmModule,
  angularNpmPackage,
  communityNpmModules,
  communityNpmPackage,
  enterpriseNpmModules,
  enterpriseNpmPackage,
  reactNpmModule,
  reactNpmPackage,
  vueNpmModule,
  vueNpmPackage,
} from './constants';

// Find old named imports and replace them with the new named import
export const updateImportPaths: JSCodeShiftTransformer = (root) => {
  // Update all old module imports to the new package imports
  convertModuleImportsToPackages(root, communityNpmModules, communityNpmPackage);
  convertModuleImportsToPackages(root, enterpriseNpmModules, enterpriseNpmPackage);
  convertModuleImportsToPackages(root, [reactNpmModule], reactNpmPackage);
  convertModuleImportsToPackages(root, [angularNpmModule], angularNpmPackage);
  convertModuleImportsToPackages(root, [vueNpmModule], vueNpmPackage);

  return root.toSource();
};

function convertModuleImportsToPackages(
  root: Collection,
  oldModules: string[],
  newPackage: string,
) {
  // Find all import declarations that match the oldModules and update them provided
  root
    .find(j.ImportDeclaration)
    .filter((path) => {
      return oldModules.some((m) => path?.node?.source?.value == m);
    })
    .forEach((path) => {
      path.node.source.value = newPackage;
    });
}
