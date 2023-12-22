import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    configureWorkerTask: lib.configureWorkerTask,
    createFsHelpers: lib.createFsHelpers,
    initTaskWorker: lib.initTaskWorker,
  });
});
