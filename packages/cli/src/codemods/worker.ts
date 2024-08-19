import { isMainThread, workerData } from 'node:worker_threads';
import {
  composeCodemods,
  createCodemodTask,
  initCodemodTaskWorker,
  loadUserConfig,
} from '@ag-grid-devtools/codemod-task-utils';
import type { Codemod } from '@ag-grid-devtools/types';
import { dynamicRequire } from '@ag-grid-devtools/utils';

if (isMainThread) throw new Error('This module must be run in a worker thread');

// Get the list of codemod module paths from the worker context
const codemodPaths = workerData.codemodPaths;
if (!isStringArray(codemodPaths)) throw new Error('Invalid worker data');

// Load the specified codemod modules
const codemods = codemodPaths.map((codemodPath) => {
  let codemod = dynamicRequire.requireDefault<Codemod>(codemodPath, import.meta);
  if (typeof codemod !== 'function') {
    throw new Error(`Invalid codemod path: ${JSON.stringify(codemodPath)}`);
  }
  return codemod;
});

const userConfig = loadUserConfig(workerData.userConfigPath);

// Combine the codemods into a single worker task
const task = createCodemodTask(composeCodemods(codemods), userConfig);

// Launch the worker task
initCodemodTaskWorker(task, { userConfig });

function isStringArray(value: unknown): value is Array<string> {
  return isTypedArray<string>(value, (item): item is string => typeof item === 'string');
}

function isTypedArray<T>(
  value: unknown,
  predicate: (item: unknown) => item is T,
): value is Array<T> {
  return Array.isArray(value) && value.every(predicate);
}
