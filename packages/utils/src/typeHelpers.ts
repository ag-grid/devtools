export function nonNull<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function unreachable(value: never): never {
  throw null;
}
