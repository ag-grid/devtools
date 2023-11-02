export const VARIANT: unique symbol = Symbol();

export type EnumDiscriminantKey = typeof VARIANT;

export type Enum<V extends { [K in keyof V]: object | void }> = {
  [K in keyof V]: { [VARIANT]: K } & (V[K] extends object ? V[K] : {});
}[keyof V];

export const Enum = {
  create: enumConstructor,
  match: match,
};

export type EnumDiscriminant<E extends Enum<any>> = Extract<
  E,
  { [VARIANT]: any }
>[EnumDiscriminantKey];

export type EnumVariant<E extends Enum<any>, T extends EnumDiscriminant<E>> = Extract<
  E,
  { [VARIANT]: T }
>;

export type EnumOptions<E extends Enum<any>, T extends EnumDiscriminant<E>> = Omit<
  EnumVariant<E, T>,
  EnumDiscriminantKey
>;

export function instantiateEnum<E extends Enum<any>>(
  variant: EnumDiscriminant<E>,
  options: EnumOptions<E, typeof variant>,
): E {
  return {
    [VARIANT]: variant,
    ...options,
  } as E;
}

export function isEnumVariant<E extends Enum<any>, T extends EnumDiscriminant<E>>(
  value: E,
  variant: T,
): value is EnumVariant<E, T> {
  return (value as E & { [VARIANT]: EnumDiscriminant<E> })[VARIANT] === variant;
}

export type EnumConstructor<E extends Enum<any>> = {
  [K in EnumDiscriminant<E>]: EnumVariantConstructor<E, K>;
};

export interface EnumVariantConstructor<E extends Enum<any>, T extends EnumDiscriminant<E>> {
  (options: EnumOptions<E, T>): EnumVariant<E, T>;
  is(value: E): value is EnumVariant<E, T>;
}

export function enumConstructor<E extends Enum<any>>(variants: {
  [K in EnumDiscriminant<E>]: true;
}): EnumConstructor<E> {
  const discriminants = Object.keys(variants) as Array<EnumDiscriminant<E>>;
  const constructors = discriminants.map(
    (
      discriminant,
    ): {
      [K in EnumDiscriminant<E>]: [K, EnumVariantConstructor<E, K>];
    }[EnumDiscriminant<E>] => [
      discriminant,
      enumVariantConstructor<E, EnumDiscriminant<E>>(discriminant),
    ],
  );
  return Object.fromEntries(constructors);
}

export function enumVariantConstructor<E extends Enum<any>, T extends EnumDiscriminant<E>>(
  discriminant: T,
): EnumVariantConstructor<E, T> {
  create.is = is;
  return create;

  function create(options: EnumOptions<E, T>): EnumVariant<E, T> {
    return instantiateEnum(discriminant, options) as EnumVariant<E, T>;
  }

  function is(value: E): value is EnumVariant<E, T> {
    return isEnumVariant(value, discriminant);
  }
}

export type EnumCases<E extends Enum<any>> = {
  [K in EnumDiscriminant<E>]: EnumCase<E, K>;
};

export type EnumCase<E extends Enum<any>, T extends EnumDiscriminant<E>> = (
  value: EnumVariant<E, T>,
) => any;

export function match<E extends Enum<any>, T extends EnumCases<E>>(
  value: EnumVariant<E, EnumDiscriminant<E>>,
  cases: T,
): ReturnType<T[keyof T]> {
  return cases[value[VARIANT]](value);
}
