export type AstType =
  | AstPrimitiveType<AstPrimitiveValueType>
  | AstArrayType<AstType>
  | AstObjectType<Record<PropertyKey, AstType>, AstType | null>
  | AstTupleType<Array<AstType>, AstType | null>
  | AstFunctionType<Array<AstType>, AstType | null, AstType>
  | AstUnionType<AstType>
  | AstIntersectionType<AstType>
  | AstAnyType;

export enum AstTypeVariant {
  Primitive,
  Array,
  Object,
  Tuple,
  Function,
  Union,
  Intersection,
  Any,
}

interface AstTypeBase<T extends AstTypeVariant> {
  type: T;
}

export interface AstPrimitiveType<V extends AstPrimitiveValueType>
  extends AstTypeBase<AstTypeVariant.Primitive> {
  value: V;
}

export enum AstPrimitiveValueType {
  Undefined,
  Null,
  Boolean,
  Number,
  String,
  Symbol,
  BigInt,
}

export interface AstArrayType<T extends AstType> extends AstTypeBase<AstTypeVariant.Array> {
  element: T;
}

export interface AstTupleType<T extends Array<AstType>, TRest extends AstType | null>
  extends AstTypeBase<AstTypeVariant.Tuple> {
  elements: T;
  rest: TRest;
}

export interface AstObjectType<P extends { [K in keyof P]: AstType }, TRest extends AstType | null>
  extends AstTypeBase<AstTypeVariant.Object> {
  fields: Array<{
    key: keyof P;
    value: P[keyof P];
  }>;
  rest: TRest;
}

export interface AstFunctionType<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
> extends AstTypeBase<AstTypeVariant.Function> {
  args: AstTupleType<TArgs, TRest>;
  result: TReturn;
}

export interface AstUnionType<T extends AstType> extends AstTypeBase<AstTypeVariant.Union> {
  variants: Array<T>;
}

export type OptionalType<T extends AstType> = AstUnionType<
  T | AstPrimitiveType<AstPrimitiveValueType.Undefined>
>;

export interface AstIntersectionType<T extends AstType>
  extends AstTypeBase<AstTypeVariant.Intersection> {
  variants: Array<T>;
}

export interface AstAnyType extends AstTypeBase<AstTypeVariant.Any> {}

export const AstType = {
  Primitive: AstPrimitiveType,
  Array: AstArrayType,
  Object: AstObjectType,
  Tuple: AstTupleType,
  Function: AstFunctionType,
  Union: AstUnionType,
  Intersection: AstIntersectionType,
  Any: AstAnyType,
};

export function AstPrimitiveType<V extends AstPrimitiveValueType>(value: V): AstPrimitiveType<V> {
  return { type: AstTypeVariant.Primitive, value };
}

export function AstArrayType<T extends AstType>(element: T): AstArrayType<T> {
  return { type: AstTypeVariant.Array, element };
}

export function AstObjectType<P extends { [K in keyof P]: AstType }>(
  properties: P,
): AstObjectType<P, null>;
export function AstObjectType<P extends { [K in keyof P]: AstType }, TRest extends AstType | null>(
  properties: P,
  rest: TRest,
): AstObjectType<P, TRest>;
export function AstObjectType<P extends { [K in keyof P]: AstType }, TRest extends AstType | null>(
  properties: P,
  rest?: TRest,
): AstObjectType<P, TRest | null> {
  return {
    type: AstTypeVariant.Object,
    fields: (Object.entries(properties) as Array<[keyof P, P[keyof P]]>).map(([key, value]) => ({
      key,
      value,
    })),
    rest: rest ?? null,
  };
}

export function AstTupleType<T extends Array<AstType>, TRest extends AstType | null>(
  elements: T,
  rest: TRest,
): AstTupleType<T, TRest>;
export function AstTupleType<T extends Array<AstType>>(elements: T): AstTupleType<T, null>;
export function AstTupleType<T extends Array<AstType>, TRest extends AstType | null>(
  elements: T,
  rest?: TRest,
): AstTupleType<T, TRest | null> {
  return { type: AstTypeVariant.Tuple, elements, rest: rest ?? null };
}

export function AstFunctionType<
  TArgs extends Array<AstType>,
  TRest extends AstType | null,
  TReturn extends AstType,
>(args: AstTupleType<TArgs, TRest>, result: TReturn): AstFunctionType<TArgs, TRest, TReturn> {
  return { type: AstTypeVariant.Function, args, result };
}

export function AstUnionType<T extends AstType>(variants: Array<T>): AstUnionType<T> {
  return { type: AstTypeVariant.Union, variants };
}

export function AstIntersectionType<T extends AstType>(variants: Array<T>): AstIntersectionType<T> {
  return { type: AstTypeVariant.Intersection, variants };
}

export function AstAnyType(): AstAnyType {
  return { type: AstTypeVariant.Any };
}
