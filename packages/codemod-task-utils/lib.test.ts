import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    composeCodemods: lib.composeCodemods,
    createCodemodTask: lib.createCodemodTask,
    initCodemodTaskWorker: lib.initCodemodTaskWorker,
  });
});
