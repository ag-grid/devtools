import * as m from '../match-utils';
import * as t from '@babel/types';
import * as v from '../visitor-utils';
import { NodePath } from '@ag-grid-devtools/ast';
import { or } from '../match-utils';

export const crosshairTransform = v.createComplexVisitor({
  matchOn: {
    crosshairs: [
      m.objectExpression({ name: 'cellRendererParams' }),
      m.objectExpression({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'sparklineOptions' }),
      m.objectProperty({ name: 'crosshairs' }),
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
import j from 'jscodeshift';
import { JSCodeShiftTransformer } from '../types';

// match cellRendererParams.sparklineOptions.type === 'column'
// replace with type: 'bar', direction: 'vertical'
export const removeCrosshairs: JSCodeShiftTransformer = (root) =>
  root
    .find(j.ObjectProperty, { key: { name: 'cellRendererParams' } })
    .find(j.ObjectProperty, { key: { name: 'sparklineOptions' } })
    .find(j.ObjectProperty, { key: { name: 'crosshairs' } })
    .forEach((path) => {
      path.replace();
    });
