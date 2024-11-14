import { NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';

export const removeImports = (path: NodePath<t.ImportDeclaration>, importsToRemove: string[]) => {
  const specifierPaths = path.get('specifiers') as NodePath<t.ImportSpecifier>[];
  specifierPaths
    .filter((specifier) => importsToRemove.includes((specifier.node.imported as t.Identifier).name))
    .forEach((specifier) => specifier.remove());
};

export const createImport = (importNames: string[], source: string) => {
  const newImportMapper = (importName: string) =>
    t.importSpecifier(t.identifier(importName), t.identifier(importName));
  return t.importDeclaration(importNames.map(newImportMapper), t.stringLiteral(source));
};
