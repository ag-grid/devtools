import { Enum, EnumVariant, instantiateEnum, isEnumVariant } from '../enumHelpers';

const enum EitherType {
  Left = 'Left',
  Right = 'Right',
}

export type Either<L, R> = Enum<{
  [EitherType.Left]: {
    value: L;
  };
  [EitherType.Right]: {
    error: R;
  };
}>;

export type Left<L, R> = EnumVariant<Either<L, R>, EitherType.Left>;
export type Right<T, E> = EnumVariant<Either<T, E>, EitherType.Right>;

export const Either = {
  [EitherType.Left]: Left,
  [EitherType.Right]: Right,
};

export function Left<L, R>(value: L): Left<L, R> {
  return instantiateEnum(EitherType.Left, { value });
}

Left.is = function is<L, R>(value: Either<L, R>): value is Left<L, R> {
  return isEnumVariant(value, EitherType.Left);
};

export function Right<L, R>(error: R): Right<L, R> {
  return instantiateEnum(EitherType.Right, { error });
}

Right.is = function is<L, R>(value: Either<L, R>): value is Right<L, R> {
  return isEnumVariant(value, EitherType.Right);
};
