import * as v from '../visitor-utils';
import * as t from '@babel/types';
import * as m from '../match-utils';
import { NodePath } from '@ag-grid-devtools/ast';
import { removeImports, createImport } from '../import-utils';
import { newPackage, oldImports, newImport } from './constants';
import { ImportSpecifierOption } from '../types';

const mergeImports = (from: ImportSpecifierOption[], to: ImportSpecifierOption, source: string) =>
  v.createComplexVisitor({
    matchOn: {
      importDeclaration: [m.importDeclaration({ some: from })],
    },
    transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
      const importParams = (matches.importDeclaration[0] as m.ImportDeclarationMatchResult)!;
      const path = importParams.path as NodePath<t.ImportDeclaration>;
      const dest = typeof to === 'string' ? { name: to } : to;

      removeImports(path, importParams.some!);
      if (!path.removed) {
        path.insertAfter(createImport([dest], source));
      }
    },
  });

export const imports = mergeImports(oldImports, newImport, newPackage);
