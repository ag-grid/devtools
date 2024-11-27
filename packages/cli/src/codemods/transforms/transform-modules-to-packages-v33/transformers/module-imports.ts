import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

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

function sortImports(imports: any[]) {
  return imports.sort((a: any, b: any) => {
    if (a.imported.name < b.imported.name) {
      return -1;
    } else if (a.imported.name > b.imported.name) {
      return 1;
    } else {
      return 0;
    }
  });
}

function isSorted(list: string[]): boolean {
  for (let i = 0; i < list.length - 1; i++) {
    if (list[i] > list[i + 1]) {
      return false;
    }
  }
  return true;
}

function updateImports(
  root: Collection,
  moduleList: string[],
  newPackage: string,
  includeDefault?: string,
) {
  // Find all import declarations that start with the communityPrefix
  const matchingImports = root.find(j.ImportDeclaration).filter((path) => {
    return moduleList.some((m) => path?.node?.source?.value == m);
  });

  // Collect all specifiers from these imports
  let allSpecifiers: any[] = [];
  let allTypeSpecifiers: any[] = [];

  if (includeDefault) {
    allSpecifiers.push(j.importSpecifier(j.identifier(includeDefault)));
  }

  matchingImports.forEach((path) => {
    path.node.source.value = newPackage; // path.node.source.value?.toString().replace('@ag-grid-community', communityPackage);

    // if the specifiers include ModuleRegistry, add AllCommunityModule
    if (path.node.specifiers?.some((s: any) => s.imported?.name === 'ModuleRegistry')) {
      // if it is sorted by name then sort updated specifiers
      const isSortedImports = isSorted(path.node.specifiers.map((s: any) => s.imported.name));

      if (isSortedImports) {
        path.node.specifiers.push(j.importSpecifier(j.identifier('AllCommunityModule')));
        path.node.specifiers = sortImports(path.node.specifiers);
      } else {
        path.node.specifiers.unshift(j.importSpecifier(j.identifier('AllCommunityModule')));
      }
    }
  });
}

// Find old named imports and replace them with the new named import
// remove the old import if no other named imports are present
export const processImports: JSCodeShiftTransformer = (root) => {
  // find import "@ag-grid-community/styles/ag-grid.css"; imports and convert to ag-grid-community
  const communityStyleImports = root.find(j.ImportDeclaration).filter((path) => {
    return !!path?.node?.source?.value?.toString()?.startsWith('@ag-grid-community/styles');
  });
  // const styleImports: any[] = [];
  communityStyleImports.forEach((path) => {
    path.node.source.value = path.node.source.value
      ?.toString()
      .replace('@ag-grid-community', communityPackage);
  });

  updateImports(root, [reactModule], reactPackage);
  updateImports(root, [angularModule], angularPackage);
  updateImports(root, [vueModule], vuePackage);
  updateImports(root, communityModules, communityPackage, 'AllCommunityModule');

  updateImports(root, enterpriseModules, enterprisePackage);

  // Add AllCommunityModule to ModuleRegistry.registerModules
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: 'ModuleRegistry' },
        property: { name: 'registerModules' },
      },
    })
    .forEach((path) => {
      const args = path.node.arguments;
      if (args.length === 1 && j.ArrayExpression.check(args[0])) {
        args[0].elements.unshift(j.identifier('AllCommunityModule'));
      }
    });

  return root.toSource();
};
