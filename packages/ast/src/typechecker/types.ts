export type Type =
  | PrimitiveType<any>
  | ArrayType<any>
  | ObjectType<any>
  | FunctionType<any, any>
  | UnionType<any>;

export enum TypeVariant {
  Primitive,
  Array,
  Object,
  Function,
  Union,
}

interface TypeBase<T extends TypeVariant> {
  type: T;
}

export interface PrimitiveType<V extends PrimitiveValueType>
  extends TypeBase<TypeVariant.Primitive> {
  value: V;
}

export enum PrimitiveValueType {
  Undefined,
  Null,
  Boolean,
  Number,
  String,
  Symbol,
  BigInt,
}

export interface ArrayType<T extends Type> extends TypeBase<TypeVariant.Array> {
  element: T;
}

export interface ObjectType<P extends { [K in keyof P]: Type }>
  extends TypeBase<TypeVariant.Object> {
  fields: Array<{
    key: keyof P;
    value: P[keyof P];
  }>;
}

export interface FunctionType<TArgs extends Array<Type>, TResult extends Type>
  extends TypeBase<TypeVariant.Function> {
  args: TArgs;
  result: TResult;
}

export interface UnionType<T extends Type> extends TypeBase<TypeVariant.Union> {
  variants: Array<T>;
}

export type OptionalType<T extends Type> = UnionType<
  T | PrimitiveType<PrimitiveValueType.Undefined>
>;
