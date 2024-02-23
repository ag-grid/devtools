export function partition<T, V extends T>(
  items: Array<T>,
  predicate: (item: T) => item is V,
): [Array<T>, Array<V>];
export function partition<T>(
  items: Array<T>,
  predicate: (item: T) => boolean,
): [Array<T>, Array<T>];
export function partition<T>(
  items: Array<T>,
  predicate: (item: T) => boolean,
): [Array<T>, Array<T>] {
  return items.reduce(
    (results, item) => {
      const [left, right] = results;
      const target = predicate(item) ? left : right;
      target.push(item);
      return results;
    },
    [new Array<T>(), new Array<T>()],
  );
}
