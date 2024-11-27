// import { newPackage, oldPackage } from './constants';

import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

import {
  communityModules,
  communityPackage,
  enterpriseModules,
  enterprisePackage,
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

function writeNewImports(
  allSpecifiers: any[],
  newPackage: string,
  root: j.Collection,
  isTypeImport = false,
) {
  allSpecifiers = sortImports(allSpecifiers);
  // Create a new import declaration with the collected specifiers
  if (allSpecifiers.length > 0) {
    const newImport = j.importDeclaration(allSpecifiers, j.literal(newPackage));
    if (isTypeImport) {
      newImport.importKind = 'type';
    }
    root.get().node.program.body.unshift(newImport);
  }
}

function updateImports(
  root: Collection,
  moduleList: string[],
  newPackage: string,
  isEnterprise = false,
) {
  // Find all import declarations that start with the communityPrefix
  const matchingImports = root.find(j.ImportDeclaration).filter((path) => {
    return moduleList.some((m) => path?.node?.source?.value == m);
  });

  // Collect all specifiers from these imports
  let allSpecifiers: any[] = [];
  let allTypeSpecifiers: any[] = [];

  if (!isEnterprise) {
    allSpecifiers.push(j.importSpecifier(j.identifier('AllCommunityModule')));
  }

  matchingImports.forEach((path) => {
    const isTypeImport = path.node.importKind === 'type';
    if (path.node.specifiers?.length ?? 0 > 0) {
      path.node.specifiers?.forEach((specifier) => {
        if (isTypeImport) {
          allTypeSpecifiers.push(specifier);
        } else {
          allSpecifiers.push(specifier);
        }
      });
      j(path).remove();
    }
  });
  writeNewImports(allSpecifiers, newPackage, root);
  writeNewImports(allTypeSpecifiers, newPackage, root, true);
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
  updateImports(root, enterpriseModules, enterprisePackage, true);

  // Add other imports (like CSS imports) back to the top
  styleImports.reverse().forEach((path) => {
    // rename the source to the new package
    path.source.value = path.source.value.replace('@ag-grid-community', communityPackage);
    root.get().node.program.body.unshift(path);
  });

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
