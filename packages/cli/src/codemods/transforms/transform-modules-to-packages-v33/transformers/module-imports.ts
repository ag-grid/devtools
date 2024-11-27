// import { newPackage, oldPackage } from './constants';

import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

import {
  communityModules,
  communityPackage,
  enterpriseModules,
  enterprisePackage,
} from './constants';

function updateImports(root: Collection, moduleList: string[], newPackage: string) {
  // Find all import declarations that start with the communityPrefix
  const matchingImports = root.find(j.ImportDeclaration).filter((path) => {
    return moduleList.some((m) => path?.node?.source?.value == m);
  });

  // Collect all specifiers from these imports
  let allSpecifiers: any[] = [];
  matchingImports.forEach((path) => {
    if (path.node.specifiers?.length ?? 0 > 0) {
      allSpecifiers.push(...path.node.specifiers!);
      j(path).remove();
    }
  });
  allSpecifiers = allSpecifiers.sort((a, b) => {
    if (a.imported.name < b.imported.name) {
      return -1;
    } else if (a.imported.name > b.imported.name) {
      return 1;
    } else {
      return 0;
    }
  });
  // Create a new import declaration with the collected specifiers
  if (allSpecifiers.length > 0) {
    const newImport = j.importDeclaration(allSpecifiers, j.literal(newPackage));
    root.get().node.program.body.unshift(newImport);
  }
}

// Find old named imports and replace them with the new named import
// remove the old import if no other named imports are present
export const processImports: JSCodeShiftTransformer = (root) => {
  // find import "@ag-grid-community/styles/ag-grid.css"; imports and convert to ag-grid-community
  const communityStyleImports = root.find(j.ImportDeclaration).filter((path) => {
    return !!path?.node?.source?.value?.toString()?.startsWith('@ag-grid-community/styles');
  });
  const styleImports: any[] = [];
  communityStyleImports.forEach((path) => {
    styleImports.push(path.node);
    j(path).remove();
  });

  updateImports(root, communityModules, communityPackage);
  updateImports(root, enterpriseModules, enterprisePackage);

  // Add other imports (like CSS imports) back to the top
  styleImports.reverse().forEach((path) => {
    // rename the source to the new package
    path.source.value = path.source.value.replace('@ag-grid-community', communityPackage);
    root.get().node.program.body.unshift(path);
  });

  return root.toSource();
};
