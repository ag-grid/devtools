import { type AstCliContext, type AstTransform } from '@ag-grid-devtools/ast';

import { identifier, objectExpression, objectProperty } from './match-utils';
import * as t from '@babel/types';
import { combineVisitors, createVisitor } from './visitor-utils';

const migrateSparklineOptionsColumnToBar = createVisitor(
  [
    objectExpression({ name: 'sparklineOptions' }),
    objectProperty({ name: 'type', value: 'column' }),
    identifier({ name: 'type' }),
  ],
  (result) => {
    const property = result[1].path;
    property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
    property.insertAfter(t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')));
  },
);

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return {
    visitor: combineVisitors([migrateSparklineOptionsColumnToBar]),
  };
};

export default transform;
