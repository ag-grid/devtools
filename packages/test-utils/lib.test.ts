import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    createMockFsHelpers: lib.createMockFsHelpers,
    loadAstTransformExampleScenarios: lib.loadAstTransformExampleScenarios,
    loadExampleScenarios: lib.loadExampleScenarios,
    loadScenarios: lib.loadScenarios,
    withErrorPrefix: lib.withErrorPrefix,
    memfs: lib.memfs,
    vol: lib.vol,
  });
});
