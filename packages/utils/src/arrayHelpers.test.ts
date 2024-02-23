import { describe, expect, test } from 'vitest';

import { partition } from './arrayHelpers';

describe(partition, () => {
  test('should partition lists of values', () => {
    const [even, odd] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
    expect(even).toEqual([2, 4]);
    expect(odd).toEqual([1, 3, 5]);
  });

  test('should handle empty lists', () => {
    const [even, odd] = partition([], (n) => n % 2 === 0);
    expect(even).toEqual([]);
    expect(odd).toEqual([]);
  });
});
