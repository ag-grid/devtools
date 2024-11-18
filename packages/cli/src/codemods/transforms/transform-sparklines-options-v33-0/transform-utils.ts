import { NodePath } from '@ag-grid-devtools/ast';
import * as t from '@babel/types';
import * as m from './match-utils';

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

export const mergeImports = (from: string[], to: string, source: string): m.ComplexTransform => ({
  matchOn: {
    importDeclaration: [m.importDeclaration({ some: from })],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const importParams = (matches.importDeclaration[0] as m.ImportDeclarationMatchResult)!;
    const path = importParams.path as NodePath<t.ImportDeclaration>;

    removeImports(path, importParams.some!);
    path.insertAfter(createImport([to], source));
  },
});

export const mergeTypecasts = (from: string[], to: string): m.ComplexTransform => ({
  matchOn: {
    typecast: [m.typeReference({ names: from })],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const typecastPath = matches.typecast[0]!.path;
    typecastPath.replaceWith(t.tsTypeReference(t.identifier(to)));
  },
});
