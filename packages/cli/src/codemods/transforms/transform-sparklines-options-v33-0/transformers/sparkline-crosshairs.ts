import * as m from '../match-utils';
import * as t from '@babel/types';
import * as v from '../visitor-utils';
import { NodePath } from '@ag-grid-devtools/ast';

export const crosshairTransform = v.createComplexVisitor({
  matchOn: {
    crosshairs: [
      m.objectProperty({ name: 'cellRendererParams' }),
      m.objectExpression({ name: 'cellRendererParams' }),
      m.objectProperty({ name: 'sparklineOptions' }),
      m.objectExpression({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'crosshairs' }),
      m.objectExpression({ name: 'crosshairs' }),
    ],
  },
  transformer: (matches: Record<string, m.SegmentMatchResult[]>) => {
    const { crosshairs } = matches;
    const sparklineOptionsExpression = crosshairs[3]!.path;

    // const crosshairsExpression = crosshairs[4]!.path;
    // crosshairsExpression.remove();

    // const yLineExpression = crosshairsExpression.get('yLine') as NodePath<t.ObjectExpression>;

    // property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
    // property.insertAfter(t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')));
  },
});
