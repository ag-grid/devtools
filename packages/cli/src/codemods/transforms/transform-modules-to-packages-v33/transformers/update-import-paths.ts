import j, { Collection } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  angularModule,
  angularPackage,
  communityModules,
  communityPackage,
  enterpriseModules,
  enterprisePackage,
  reactModule,
  reactPackage,
  vueModule,
  vuePackage,
} from './constants';

// Find old named imports and replace them with the new named import
export const updateImportPaths: JSCodeShiftTransformer = (root) => {
  // Update all old module imports to the new package imports
  convertModuleImportsToPackages(root, communityModules, communityPackage);
  convertModuleImportsToPackages(root, enterpriseModules, enterprisePackage);
  convertModuleImportsToPackages(root, [reactModule], reactPackage);
  convertModuleImportsToPackages(root, [angularModule], angularPackage);
  convertModuleImportsToPackages(root, [vueModule], vuePackage);

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
