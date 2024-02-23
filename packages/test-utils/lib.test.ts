import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    createMockFsHelpers: lib.createMockFsHelpers,
    scenarios: lib.scenarios,
  });
});