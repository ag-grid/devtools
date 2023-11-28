import { type Binding, type NodePath, type Types } from '@ag-grid-devtools/ast';
import { nonNull } from '@ag-grid-devtools/utils';

type JSXElement = Types.JSXElement;
type JSXAttribute = Types.JSXAttribute;

export const REACT_REF_PROP_NAME = 'ref';
export const REACT_REF_VALUE_ACCESSOR_NAME = 'current';

export function getReactElementRefAttribute(
  element: NodePath<JSXElement>,
): NodePath<JSXAttribute> | null {
  return (
    element
      .get('openingElement')
      .get('attributes')
      .map((attribute) => {
        if (!attribute.isJSXAttribute()) return null;
        const propName = attribute.get('name');
        if (!propName.isJSXIdentifier()) return null;
        if (propName.node.name !== REACT_REF_PROP_NAME) return null;
        return attribute;
      })
      .filter(nonNull)[0] || null
  );
}

export function getReactBoundElementRef(binding: Binding): NodePath<JSXElement> | null {
  return (
    binding.referencePaths
      .map((reference) => {
        if (!reference.parentPath || !reference.parentPath.isJSXExpressionContainer()) return false;
        const jsxExpressionContainer = reference.parentPath;
        if (!jsxExpressionContainer.parentPath.isJSXAttribute()) return null;
        const jsxAttribute = jsxExpressionContainer.parentPath;
        if (!jsxAttribute.parentPath.isJSXOpeningElement()) return null;
        const jsxOpeningElement = jsxAttribute.parentPath;
        if (!jsxOpeningElement.parentPath.isJSXElement()) return null;
        const jsxElement = jsxOpeningElement.parentPath;
        const propName = jsxAttribute.get('name');
        if (!propName.isJSXIdentifier()) return null;
        if (propName.node.name !== REACT_REF_PROP_NAME) return null;
        return jsxElement;
      })
      .filter(nonNull)[0] || null
  );
}
