import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    createCodemodTask: lib.createCodemodTask,
    initCodemodTaskWorker: lib.initCodemodTaskWorker,
  });
});
