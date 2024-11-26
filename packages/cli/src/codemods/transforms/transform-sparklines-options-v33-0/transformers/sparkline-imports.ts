import { newPackage, oldImports, newImport, oldPackage } from './constants';

import j, { Collection } from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';
import { reset } from '../jscodeshift.adapter';

export const processImports: JSCodeShiftTransformer = (root) => {
  let matches = 0;

  let result: Collection<any> = root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === oldPackage)
    .find(j.ImportSpecifier)
    .filter((path) => oldImports.includes(path.node.imported.name));

  matches = result.length;

  if (matches > 0) {
    result = result.forEach((path) => path.replace());
  }

  result = reset(result)
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === oldPackage);

  const importSpecifiers = result.find(j.ImportSpecifier);
  if (importSpecifiers.length === 0) {
    result = result.forEach((path) => {
      path.replace();
    });
  }

  if (matches > 0) {
    // construct new import
    result = reset(result);
    const imports = result.find(j.ImportDeclaration);

    const newImportDeclaration = j.importDeclaration(
      [j.importSpecifier(j.identifier((newImport as any).name))],
      j.stringLiteral(newPackage),
      'type',
    );

    if (imports.length > 0) {
      result = imports.insertAfter(newImportDeclaration);
    } else {
      result.get().node.program.body.unshift(newImportDeclaration);
    }
  }

  return result;
};
