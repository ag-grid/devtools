import { test, expect } from 'vitest';

import lib from './lib';

test('exposes a top-level default export', () => {
  expect(lib).toBeInstanceOf(Object);
});
