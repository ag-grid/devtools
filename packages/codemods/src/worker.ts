import { createRequire } from 'node:module';
import { isMainThread, workerData } from 'node:worker_threads';
import {
  composeCodemods,
  createCodemodTask,
  initCodemodTaskWorker,
} from '@ag-grid-devtools/codemod-task-utils';
import type { Codemod } from '@ag-grid-devtools/types';

if (isMainThread) throw new Error('This module must be run in a worker thread');

// Get the list of codemod module paths from the worker context
const codemodPaths = workerData;
if (!isStringArray(codemodPaths)) throw new Error('Invalid worker data');

// Load the specified codemod modules
const codemods = codemodPaths.map((codemodPath) => {
  const codemod = requireDynamicModule<Codemod>(codemodPath, import.meta);
  if (typeof codemod !== 'function') {
    throw new Error(`Invalid codemod path: ${JSON.stringify(codemodPath)}`);
  }
  return codemod;
});

// Combine the codemods into a single worker task
const task = createCodemodTask(composeCodemods(codemods));

// Launch the worker task
initCodemodTaskWorker(task);

function isStringArray(value: unknown): value is Array<string> {
  return isTypedArray<string>(value, (item): item is string => typeof item === 'string');
}

function isTypedArray<T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is Array<T> {
  return Array.isArray(value) && value.every((item) => predicate(item));
}

function requireDynamicModule<T = unknown>(path: string, meta: ImportMeta): T {
  const require = createRequire(meta.url);
  return require(path);
}
