import { NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';
import { ImportSpecifierOption } from './types';

export const removeImports = (
  path: NodePath<t.ImportDeclaration>,
  importsToRemove: ImportSpecifierOption[],
) => {
  const specifierPaths = path.get('specifiers') as NodePath<t.ImportSpecifier>[];
  const toRemove = specifierPaths.filter((specifier) =>
    importsToRemove.includes((specifier.node.imported as t.Identifier).name),
  );

  if (toRemove.length === specifierPaths.length) {
    path.remove();
  } else {
    toRemove.forEach((specifier) => specifier.remove());
  }
};

export const createImport = (imports: ImportSpecifierOption[], source: string) => {
  const newImportMapper = (importOption: ImportSpecifierOption) => {
    const name = typeof importOption === 'string' ? importOption : importOption.name;
    const type = typeof importOption === 'string' ? undefined : importOption.type;
    const importSpecifier = t.importSpecifier(t.identifier(name), t.identifier(name));
    importSpecifier.importKind = type ?? 'value';
    return importSpecifier;
  };
  return t.importDeclaration(imports.map(newImportMapper), t.stringLiteral(source));
};
