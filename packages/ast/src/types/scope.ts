import { Enum, EnumVariant, VARIANT } from '@ag-grid-devtools/utils';
import { type AstNode } from './ast';
import { type Types } from './node';
import { type Binding, type NodePath } from './transform';

type Class = Types.Class;
type Expression = Types.Expression;
type Identifier = Types.Identifier;
type MemberExpression = Types.MemberExpression;
type ObjectExpression = Types.ObjectExpression;
type Property = Types.Property;

export interface AccessorPath {
  root: {
    target: NodePath<AstNode>;
    references: Array<AccessorReference>;
  };
  path: Array<{
    key: AccessorKey;
    references: Array<AccessorReference>;
  }>;
}

export type AccessorKey = Enum<{
  Property: {
    name: string;
  };
  PrivateField: {
    name: string;
  };
  Index: {
    index: number;
  };
  ObjectRest: {
    excluded: Array<AccessorKey>;
  };
  ArrayRest: {
    startIndex: number;
  };
  Computed: {
    expression: NodePath<Expression>;
  };
}>;

export type PropertyAccessorKey = EnumVariant<AccessorKey, 'Property'>;
export type PrivateFieldAccessorKey = EnumVariant<AccessorKey, 'PrivateField'>;
export type IndexAccessorKey = EnumVariant<AccessorKey, 'Index'>;
export type ObjectRestAccessorKey = EnumVariant<AccessorKey, 'ObjectRest'>;
export type ArrayRestAccessorKey = EnumVariant<AccessorKey, 'ArrayRest'>;
export type ComputedAccessorKey = EnumVariant<AccessorKey, 'Computed'>;

export const AccessorKey = Enum.create<AccessorKey>({
  Property: true,
  PrivateField: true,
  Index: true,
  ObjectRest: true,
  ArrayRest: true,
  Computed: true,
});

export function areAccessorKeysEqual(left: AccessorKey, right: AccessorKey): boolean {
  switch (left[VARIANT]) {
    case 'Property':
      return AccessorKey.Property.is(right) && arePropertyAccessorKeysEqual(left, right);
    case 'PrivateField':
      return AccessorKey.PrivateField.is(right) && arePrivateFieldAccessorKeysEqual(left, right);
    case 'Index':
      return AccessorKey.Index.is(right) && areIndexAccessorKeysEqual(left, right);
    case 'ObjectRest':
      return AccessorKey.ObjectRest.is(right) && areObjectRestAccessorKeysEqual(left, right);
    case 'ArrayRest':
      return AccessorKey.ArrayRest.is(right) && areArrayRestAccessorKeysEqual(left, right);
    case 'Computed':
      return AccessorKey.Computed.is(right) && areComputedAccessorKeysEqual(left, right);
  }
}

function arePropertyAccessorKeysEqual(
  left: PropertyAccessorKey,
  right: PropertyAccessorKey,
): boolean {
  return left.name === right.name;
}

function arePrivateFieldAccessorKeysEqual(
  left: PrivateFieldAccessorKey,
  right: PrivateFieldAccessorKey,
): boolean {
  return left.name === right.name;
}

function areIndexAccessorKeysEqual(left: IndexAccessorKey, right: IndexAccessorKey): boolean {
  return left.index === right.index;
}

function areObjectRestAccessorKeysEqual(
  left: ObjectRestAccessorKey,
  right: ObjectRestAccessorKey,
): boolean {
  return (
    left.excluded.length === right.excluded.length &&
    left.excluded.every((excludedKey, index) =>
      areAccessorKeysEqual(excludedKey, right.excluded[index]),
    )
  );
}

function areArrayRestAccessorKeysEqual(
  left: ArrayRestAccessorKey,
  right: ArrayRestAccessorKey,
): boolean {
  return left.startIndex === right.startIndex;
}

function areComputedAccessorKeysEqual(
  left: ComputedAccessorKey,
  right: ComputedAccessorKey,
): boolean {
  return (
    left.expression.node === right.expression.node &&
    left.expression.scope === right.expression.scope
  );
}

export type AccessorReference = Enum<{
  Local: {
    binding: Binding;
    accessor: NodePath<Identifier>;
  };
  Property: {
    target: NodePath<Class | ObjectExpression>;
    accessor: NodePath<Property | MemberExpression>;
  };
}>;

export const AccessorReference = Enum.create<AccessorReference>({
  Local: true,
  Property: true,
});

export type LocalAccessorReference = EnumVariant<AccessorReference, 'Local'>;
export type PropertyAccessorReference = EnumVariant<AccessorReference, 'Property'>;
