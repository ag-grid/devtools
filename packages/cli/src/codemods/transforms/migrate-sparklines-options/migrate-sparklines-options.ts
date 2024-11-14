import { NodePath, type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import * as m from './match-utils';
import * as t from '@babel/types';
import * as v from './visitor-utils';
import { removeImports, createImport } from './transform-utils';

export const c2bTransform: m.ComplexTransform = {
  matchOn: {
    columnSparkline: [
      m.objectExpression({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'type', value: 'column' }),
    ],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const { columnSparkline } = matches;
    const property = columnSparkline[1]!.path;
    property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
    property.insertAfter(t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')));
  },
};

export const importTransformer: m.ComplexTransform = {
  matchOn: {
    importDeclaration: [
      m.importDeclaration({
        some: [
          'AreaSparklineOptions',
          'BarSparklineOptions',
          'ColumnSparklineOptions',
          'LineSparklineOptions',
        ],
      }),
    ],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const { importDeclaration } = matches;
    const importParams = (importDeclaration[0] as m.ImportDeclarationMatchResult)!;
    const path = importParams.path as NodePath<t.ImportDeclaration>;

    removeImports(path, importParams.some!);
    path.insertAfter(createImport(['AgSparklineOptions'], 'ag-charts-types'));
  },
};

export const typecastTransformer: m.ComplexTransform = {
  matchOn: {
    sparklineTypecast: [m.typeReference({ name: 'LineSparklineOptions' })],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const sparklineTypecastPath = matches.sparklineTypecast[0]!.path;
    sparklineTypecastPath.replaceWith(t.tsTypeReference(t.identifier('AgSparklineOptions')));
  },
};

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return {
    visitor: v.combineVisitors(
      v.createComplexVisitor(c2bTransform),
      v.createComplexVisitor(importTransformer),
      v.createComplexVisitor(typecastTransformer),
    ),
  };
};

export default transform;
