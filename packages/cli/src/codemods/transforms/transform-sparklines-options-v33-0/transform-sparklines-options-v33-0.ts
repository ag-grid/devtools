import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import * as m from './match-utils';
import * as t from '@babel/types';
import * as v from './visitor-utils';
import { mergeImports, mergeTypecasts } from './transform-utils';
import { jsCodeShiftTransform } from './jscodeshift.adapter';
import {
  chartTypeSubobject,
  columnToVerticalBarTransform,
  highlightStyle,
  markerFormatter,
  processImports,
  removeCrosshairs,
  replaceTypes,
} from './transformers';

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
  return jsCodeShiftTransform(
    columnToVerticalBarTransform,
    processImports,
    removeCrosshairs,
    replaceTypes,
    // chartTypeSubobject,
    // highlightStyle,
    markerFormatter,
  );
};

export default transform;
