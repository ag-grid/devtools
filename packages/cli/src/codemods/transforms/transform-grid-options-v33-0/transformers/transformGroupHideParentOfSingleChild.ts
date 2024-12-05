import j, {
  ASTPath,
  ConditionalExpression,
  Literal,
  ObjectProperty,
  JSXAttribute,
  StringLiteral,
} from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  createLogicalOr,
  createTernary,
  getKeyValueNode,
  getSibling,
  getValueFromNode,
  wrapValue,
} from './utils';

const transformGroupRemoveSingleChildren = (path: ASTPath<ObjectProperty | JSXAttribute>) => {
  path.replace(getKeyValueNode(path, 'groupHideParentOfSingleChild', getValueFromNode(path.value)));
};

const transformGroupRemoveLowestSingleChildren = (path: ASTPath<ObjectProperty | JSXAttribute>) => {
  const encapsulatedValue = getValueFromNode(path.value);
  const correctedValue: ConditionalExpression | StringLiteral | Literal = createTernary(
    encapsulatedValue as any,
    j.stringLiteral('leafGroupsOnly'),
    j.booleanLiteral(false),
  );

  // find if property already exists from first step, if so merge
  const existingSibling: ObjectProperty | JSXAttribute | undefined = getSibling(
    path,
    'groupHideParentOfSingleChild',
  );

  // simply rename this prop if it doesn't exist already
  if (!existingSibling) {
    path.replace(getKeyValueNode(path, 'groupHideParentOfSingleChild', correctedValue));
    return;
  }

  const siblingValue = getValueFromNode(existingSibling);
  // append to the existing groupHideParentOfSingleChild and delete this prop
  existingSibling.value = wrapValue(
    path,
    createLogicalOr(siblingValue ?? j.booleanLiteral(true), correctedValue),
  );
  path.replace();
};

const transformGroupHideParentOfSingleChild: JSCodeShiftTransformer = (root) => {
  // translate groupRemoveSingleChildren to groupHideParentOfSingleChild
  root
    .find(ObjectProperty, { key: { name: 'groupRemoveSingleChildren' } })
    .forEach(transformGroupRemoveSingleChildren);
  root
    .find(JSXAttribute, { name: { name: 'groupRemoveSingleChildren' } })
    .forEach(transformGroupRemoveSingleChildren);

  // translate groupRemoveLowestSingleChildren to groupHideParentOfSingleChild
  // and merge with existing groupHideParentOfSingleChild if it exists
  root
    .find(ObjectProperty, { key: { name: 'groupRemoveLowestSingleChildren' } })
    .forEach(transformGroupRemoveLowestSingleChildren);
  root
    .find(JSXAttribute, { name: { name: 'groupRemoveLowestSingleChildren' } })
    .forEach(transformGroupRemoveLowestSingleChildren);
};

export { transformGroupHideParentOfSingleChild };
