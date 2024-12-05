import j, { ASTPath, ObjectProperty, JSXAttribute } from 'jscodeshift';

import { JSCodeShiftTransformer } from '../../../plugins/jscodeshift';
import {
  createLogicalAnd,
  createLogicalOr,
  createTernary,
  getKeyValueNode,
  getSibling,
  getValueFromNode,
  wrapValue,
} from './utils';

const transformSuppressRowGroupHidesColumns = (path: ASTPath<ObjectProperty | JSXAttribute>) => {
  const thisValObj = getValueFromNode(path.value);
  if (thisValObj?.type === 'BooleanLiteral' && typeof thisValObj.value === 'boolean') {
    // if it's a boolean, we don't need to wrap this in a ternary, use literal
    path.replace(
      getKeyValueNode(
        path,
        'suppressGroupChangesColumnVisibility',
        thisValObj.value ? j.stringLiteral('suppressHideOnGroup') : j.booleanLiteral(false),
      ),
    );
    return;
  }

  const newValue = createTernary(
    thisValObj ?? j.booleanLiteral(true),
    j.stringLiteral('suppressHideOnGroup'),
    j.booleanLiteral(false),
  );
  path.replace(getKeyValueNode(path, 'suppressGroupChangesColumnVisibility', newValue));
};

const transformSuppressMakeColumnVisibleAfterUnGroup = (
  path: ASTPath<ObjectProperty | JSXAttribute>,
) => {
  const thisValObj = getValueFromNode(path.value);
  const sibling = getSibling(path, 'suppressGroupChangesColumnVisibility');
  if (sibling) {
    const thisVal = createTernary(
      thisValObj,
      j.stringLiteral('suppressShowOnUngroup'),
      j.booleanLiteral(false),
    );
    const siblingValue = getValueFromNode(sibling);

    if (thisValObj.value === true && siblingValue.value === 'suppressHideOnGroup') {
      // if this is true, and sibling is 'suppressHideOnGroup', set to true for shorthand.
      sibling.value = wrapValue(path, j.booleanLiteral(true));
      path.replace();
      return;
    }
    sibling.value = wrapValue(
      path,
      createTernary(
        createLogicalAnd(thisValObj, siblingValue),
        j.booleanLiteral(true),
        createLogicalOr(siblingValue, thisVal),
      ),
    );
    path.replace();
    return;
  }
  if (thisValObj?.type === 'BooleanLiteral' && typeof thisValObj.value === 'boolean') {
    // if it's a boolean, we don't need to wrap this in a ternary, use literal
    path.replace(
      getKeyValueNode(
        path,
        'suppressGroupChangesColumnVisibility',
        thisValObj.value ? j.stringLiteral('suppressShowOnUngroup') : j.booleanLiteral(false),
      ),
    );
    return;
  }

  const newValue = thisValObj
    ? createTernary(thisValObj, j.stringLiteral('suppressShowOnUngroup'), j.booleanLiteral(false))
    : undefined;
  path.replace(getKeyValueNode(path, 'suppressGroupChangesColumnVisibility', newValue));
};

const transformSuppressGroupChangesColumnVisibility: JSCodeShiftTransformer = (root) => {
  // translate suppressRowGroupHidesColumns to suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup'
  root
    .find(ObjectProperty, { key: { name: 'suppressRowGroupHidesColumns' } })
    .forEach(transformSuppressRowGroupHidesColumns);
  root
    .find(JSXAttribute, { name: { name: 'suppressRowGroupHidesColumns' } })
    .forEach(transformSuppressRowGroupHidesColumns);

  // translate suppressMakeColumnVisibleAfterUnGroup to suppressGroupChangesColumnVisibility: 'suppressHideOnGroup'
  // and merge with existing groupHideParentOfSingleChild if it exists
  root
    .find(ObjectProperty, { key: { name: 'suppressMakeColumnVisibleAfterUnGroup' } })
    .forEach(transformSuppressMakeColumnVisibleAfterUnGroup);
  root
    .find(JSXAttribute, { name: { name: 'suppressMakeColumnVisibleAfterUnGroup' } })
    .forEach(transformSuppressMakeColumnVisibleAfterUnGroup);
};

export { transformSuppressGroupChangesColumnVisibility };
