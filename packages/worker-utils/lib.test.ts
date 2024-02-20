import { expect, test } from 'vitest';

import * as lib from './lib';

test('module exports', () => {
  expect({ ...lib }).toEqual({
    configureWorkerTask: lib.configureWorkerTask,
    createFsHelpers: lib.createFsHelpers,
    initCodemodTaskWorker: lib.initCodemodTaskWorker,
    initTaskWorker: lib.initTaskWorker,
    serializeWorkerError: lib.serializeWorkerError,
  });
});
