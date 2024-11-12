import {
  NodePath,
  type AstCliContext,
  type AstTransform,
  type Visitor,
} from '@ag-grid-devtools/ast';

import { identifier, match, objectExpression, objectProperty } from './match-utils';
import * as t from '@babel/types';

const onMatch = (
  path: NodePath,
  conditions: any[],
  then: (path: NodePath, results: any[]) => void,
) => {
  return {} as Visitor;
};

const transform: AstTransform<AstCliContext> = function migrateSparklinesOptions(_babel) {
  return {
    visitor: {
      Identifier(path) {
        const result = match(path, [
          identifier({ name: 'type' }),
          objectProperty({ name: 'type', value: 'column' }),
          objectExpression({ name: 'sparklineOptions' }),
        ]);

        if (result) {
          const property = result[1].path;
          property.replaceWith(t.objectProperty(t.identifier('type'), t.stringLiteral('bar')));
          property.insertAfter(
            t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')),
          );
        }

        // if (isIdentifierPath(path) && path.node.name === 'type') {
        //   const objectPropertyPath = path.parentPath;
        //   if (isObjectPropertyPath(objectPropertyPath)) {
        //     const objectPropertyValueNode = objectPropertyPath.node.value;
        //     if (isStringLiteralNode(objectPropertyValueNode)) {
        //       const stringLiteralValue = objectPropertyValueNode.value;
        //       if (stringLiteralValue === 'column') {
        //         objectPropertyPath.replaceWith(
        //           t.objectProperty(t.identifier('type'), t.stringLiteral('bar')),
        //         );
        //         objectPropertyPath.insertAfter(
        //           t.objectProperty(t.identifier('direction'), t.stringLiteral('vertical')),
        //         );
        //       }
        //     }
        //   }
        // }
      },
    },
  };
};

export default transform;
