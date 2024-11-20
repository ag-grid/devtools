import * as m from '../match-utils';
import * as t from '@babel/types';
import * as v from '../visitor-utils';

// match cellRendererParams.sparklineOptions.type === 'column'
// replace with type: 'bar', direction: 'vertical'
export const columnTransform = v.createComplexVisitor({
  matchOn: {
    columnSparkline: [
      m.objectProperty({ name: 'cellRendererParams' }),
      m.objectExpression({ name: 'cellRendererParams' }),
      m.objectProperty({ name: 'sparklineOptions' }),
      m.objectExpression({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'type', value: 'column' }),
    ],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const { columnSparkline } = matches;
    const property = columnSparkline[4]!.path;
    property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
    property.insertAfter(t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')));
  },
});
