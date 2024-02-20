import {
  getLiteralPropertyKey,
  type AstCliContext,
  type AstTransform,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import { isColumnApiReference } from '@ag-grid-devtools/codemod-utils';

type Expression = Types.Expression;
type Identifier = Types.Identifier;
type Literal = Types.Literal;
type PrivateName = Types.PrivateName;

const COLUMN_API_PROPERTY_NAME = 'columnApi';
const GRID_API_PROPERTY_NAME = 'api';

const transform: AstTransform<AstCliContext> = function migrateLegacyColumnApi(babel) {
  const { types: t } = babel;
  return {
    visitor: {
      // Replace `_.columnApi` property accessors with `_.api`
      MemberExpression(path, context) {
        const object = path.get('object');
        const property = path.get('property');
        const computed = path.node.computed;
        // Ignore any property accesses that refer to named fields on the current `this` object
        if (object.isThisExpression()) return;
        // Ignore any property accesses that do not refer to the `.columnApi` property
        if (!isNamedPropertyAccess(COLUMN_API_PROPERTY_NAME, property, computed)) return;
        // Ignore any property accesses that do not target a grid column API
        if (!isColumnApiReference(path, context)) return;
        // Now that we know we are dealing with a grid column API, rename the field
        property.replaceWith(t.identifier(GRID_API_PROPERTY_NAME));
      },
      // Replace `{ columnApi: _ }` destructuring patterns with `{ api: _ }`
      ObjectProperty(path, context) {
        // Ignore any properties that do not belong to a destructuring patterh
        if (!path.parentPath.isObjectPattern()) return;
        // Ignore any property accesses that do not refer to the `.columnApi` property
        const key = path.get('key');
        const computed = path.node.computed;
        if (!isNamedPropertyAccess(COLUMN_API_PROPERTY_NAME, key, computed)) return;
        const value = path.get('value');
        // Ignore any property accesses that do not target a grid column API
        if (!value.isExpression() && !value.isIdentifier()) return;
        if (!isColumnApiReference(value, context)) return;
        // Now that we know we are dealing with a grid column API, rename the field
        path.replaceWith(t.objectProperty(t.identifier(GRID_API_PROPERTY_NAME), value.node));
      },
      // FIXME: rewrite TypeScript type annotations
    },
  };
};

export default transform;

function isNamedPropertyAccess(
  propertyName: string,
  key: NodePath<Identifier | Literal | PrivateName | Expression>,
  computed: boolean,
): boolean {
  if (!computed && key.isIdentifier()) return key.node.name === propertyName;
  if (key.isLiteral()) return getLiteralPropertyKey(key.node) === propertyName;
  return false;
}
