import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../jscodeshift.adapter';

// Find old named imports and replace them with the new named import
// remove the old import if no other named imports are present
export const multiTypeImportToSingle =
  (
    oldPackage: string,
    oldImports: string[],
    newPackage: string,
    newImport: string,
  ): JSCodeShiftTransformer =>
  (root) => {
    // find old imports
    const importToBeInspected: Collection<any> = root
      .find(j.ImportDeclaration)
      .filter((path) => path.node.source.value === oldPackage);

    // get all named imports in old import
    const allSpecifiers = importToBeInspected.find(j.ImportSpecifier);

    // get all old named imports
    const importsToBeRemoved = allSpecifiers.filter((path) =>
      oldImports.includes(path.node.imported.name),
    );

    const matches = importsToBeRemoved.length;
    const nonMatchingImports = allSpecifiers.length - matches;

    // remove old named imports, if any
    importsToBeRemoved.forEach((path) => path.replace());

    // remove import line if no other named imports were present
    if (nonMatchingImports === 0) {
      const importSpecifiers = importToBeInspected.find(j.ImportSpecifier);
      if (importSpecifiers.length === 0) {
        importToBeInspected.forEach((path) => path.replace());
      }
    }

    // no need to add new import if no old imports were found
    if (matches === 0) {
      return;
    }

    // construct new import
    const newImportDeclaration = j.importDeclaration(
      [j.importSpecifier(j.identifier(newImport))],
      j.stringLiteral(newPackage),
      'type',
    );

    // find attachment point
    const imports = root.find(j.ImportDeclaration);

    if (imports.length > 0) {
      // after imports
      imports.insertAfter(newImportDeclaration);
    } else {
      // top of file
      root.get().node.program.body.unshift(newImportDeclaration);
    }
  };
