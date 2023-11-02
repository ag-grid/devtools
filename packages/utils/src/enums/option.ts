import { Enum, EnumVariant, instantiateEnum, isEnumVariant } from '../enumHelpers';

const enum OptionType {
  Some = 'Some',
  None = 'None',
}

export type Option<T> = Enum<{
  [OptionType.Some]: {
    value: T;
  };
  [OptionType.None]: void;
}>;

export const Option = {
  [OptionType.Some]: Some,
  [OptionType.None]: None,
};

export type Some<T> = EnumVariant<Option<T>, OptionType.Some>;
export type None<T> = EnumVariant<Option<T>, OptionType.None>;

export function Some<T>(value: T): Some<T> {
  return instantiateEnum(OptionType.Some, { value });
}

Some.is = function is<T>(value: Option<T>): value is Some<T> {
  return isEnumVariant(value, OptionType.Some);
};

export function None<T>(): None<T> {
  return instantiateEnum(OptionType.None, {});
}

None.is = function is<T>(value: Option<T>): value is None<T> {
  return isEnumVariant(value, OptionType.None);
};
