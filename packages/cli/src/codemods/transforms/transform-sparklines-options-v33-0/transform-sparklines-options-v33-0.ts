import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import * as m from './match-utils';
import * as t from '@babel/types';
import * as v from './visitor-utils';
import { mergeImports, mergeTypecasts } from './transform-utils';

export const c2bTransform: m.ComplexTransform = {
  matchOn: {
    columnSparkline: [
      m.object({ name: 'cellRendererParams' }),
      m.object({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'type', value: 'column' }),
    ],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const { columnSparkline } = matches;
    const property = columnSparkline[4]!.path;
    property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
    property.insertAfter(t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')));
  },
};

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  const oldOptionNames = [
    'AreaSparklineOptions',
    'BarSparklineOptions',
    'ColumnSparklineOptions',
    'LineSparklineOptions',
  ];

  const newOptionName = 'AgSparklineOptions';
  const newPackage = 'ag-charts-types';

  return {
    visitor: v.combineVisitors(
      v.createComplexVisitor(c2bTransform),
      v.createComplexVisitor(mergeImports(oldOptionNames, newOptionName, newPackage)),
      v.createComplexVisitor(mergeTypecasts(oldOptionNames, newOptionName)),
    ),
  };
};

export default transform;
