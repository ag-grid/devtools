import { Enum, EnumVariant, instantiateEnum, isEnumVariant } from '../enumHelpers';

const enum ResultType {
  Ok = 'Ok',
  Err = 'Err',
}

export type Result<T, E> = Enum<{
  [ResultType.Ok]: {
    value: T;
  };
  [ResultType.Err]: {
    error: E;
  };
}>;

export type Ok<T, E> = EnumVariant<Result<T, E>, ResultType.Ok>;
export type Err<T, E> = EnumVariant<Result<T, E>, ResultType.Err>;

export const Result = {
  [ResultType.Ok]: Ok,
  [ResultType.Err]: Err,
};

export function Ok<T, E>(value: T): Ok<T, E> {
  return instantiateEnum(ResultType.Ok, { value });
}

Ok.is = function is<T, E>(value: Result<T, E>): value is Ok<T, E> {
  return isEnumVariant(value, ResultType.Ok);
};

export function Err<T, E>(error: E): Err<T, E> {
  return instantiateEnum(ResultType.Err, { error });
}

Err.is = function is<T, E>(value: Result<T, E>): value is Err<T, E> {
  return isEnumVariant(value, ResultType.Err);
};
