import { type AstCliContext, type AstTransform, type Babel } from '@ag-grid-devtools/ast';
import j, {
  ASTPath,
  ConditionalExpression,
  Literal,
  ObjectProperty,
  JSXAttribute,
} from 'jscodeshift';

import { jsCodeShiftTransform, JSCodeShiftTransformer } from '../../plugins/jscodeshift';

const transformGroupHideParentOfSingleChild: JSCodeShiftTransformer = (root) => {
  // translate groupRemoveSingleChildren to groupHideParentOfSingleChild
  // js
  root
    .find(ObjectProperty, { key: { name: 'groupRemoveSingleChildren' } })
    .forEach((path: ASTPath<ObjectProperty>) => {
      const { value: objProp } = path;

      path.replace(
        j.objectProperty(j.identifier('groupHideParentOfSingleChild'), path.value.value),
      );
    });
  //jsx
  root.find(JSXAttribute, { name: { name: 'groupRemoveSingleChildren' } }).forEach((path) => {
    path.replace(j.jsxAttribute(j.jsxIdentifier('groupHideParentOfSingleChild'), path.node.value));
  });
  //angular?

  // translate groupRemoveLowestSingleChildren to groupHideParentOfSingleChild
  // js
  root
    .find(ObjectProperty, { key: { name: 'groupRemoveLowestSingleChildren' } })
    .forEach((path: ASTPath<ObjectProperty>) => {
      const { value: objProp } = path;
      const { value: encapsulatedValue } = objProp;

      // if literal, replace with literal, otherwise wrap in ternary
      let correctedValue: ConditionalExpression | Literal;
      if (encapsulatedValue.type === 'BooleanLiteral') {
        correctedValue = encapsulatedValue.value ? j.literal('leafGroupsOnly') : j.literal(false);
      } else {
        correctedValue = j.conditionalExpression(
          encapsulatedValue as any, // we're just pushing this into a ternary, so not changing whatever it was
          j.literal('leafGroupsOnly'),
          j.literal(false),
        );
      }

      // find if property already exists from first step, if so merge
      const existingProperty: ObjectProperty | undefined = path.parent.value.properties.find(
        (child: ObjectProperty) =>
          child.key.type === 'Identifier' && child.key.name === 'groupHideParentOfSingleChild',
      );

      // simply rename this prop if it doesn't exist already
      if (!existingProperty) {
        path.replace(
          j.objectProperty(j.identifier('groupHideParentOfSingleChild'), correctedValue),
        );
        return;
      }

      // otherwise append to the existing groupHideParentOfSingleChild
      existingProperty.value = j.logicalExpression(
        '||',
        existingProperty.value as any,
        correctedValue,
      );
      path.replace();
    });
};

const transform: AstTransform<AstCliContext> = (babel: Babel) => {
  return jsCodeShiftTransform(transformGroupHideParentOfSingleChild)(babel);
};

export default transform;
