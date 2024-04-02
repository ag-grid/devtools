import { type CodemodTask, type CodemodTaskInput, type FsUtils } from '@ag-grid-devtools/types';
import {
  configureWorkerTask,
  createFsHelpers,
  initTaskWorker,
} from '@ag-grid-devtools/worker-utils';

export function initCodemodTaskWorker(
  task: CodemodTask,
  options?: {
    fs?: FsUtils;
  },
): void {
  const { fs = createFsHelpers() } = options || {};
  const workerTask = configureWorkerTask(task, {
    main: parseMainThreadTaskInput,
    worker: parseWorkerThreadTaskInput,
  });
  initTaskWorker(workerTask, { fs });
}

function parseMainThreadTaskInput(env: Pick<NodeJS.Process, 'argv' | 'env'>): CodemodTaskInput {
  const {
    env: { INPUT_FILE, DRY_RUN },
  } = env;
  if (!INPUT_FILE) throw new Error('Missing INPUT_FILE environment variable');
  const inputFilePath = INPUT_FILE;
  const dryRun = parseBooleanEnvVar(DRY_RUN);
  return {
    inputFilePath,
    dryRun,
  };
}

function parseWorkerThreadTaskInput(data: unknown): CodemodTaskInput {
  if (!data || typeof data !== 'object') throw new Error('Invalid task input');
  const { inputFilePath, dryRun } = data as Record<string, unknown>;
  if (typeof inputFilePath !== 'string') {
    throw new Error(`Invalid inputFilePath field value: ${JSON.stringify(inputFilePath)}`);
  }
  if (typeof dryRun !== 'boolean') {
    throw new Error(`Invalid dryRun field value: ${JSON.stringify(dryRun)}`);
  }
  return {
    inputFilePath,
    dryRun: Boolean(dryRun),
  };
}

function parseBooleanEnvVar(value: string | undefined): boolean {
  if (!value) return false;
  switch (value.toLowerCase()) {
    case '0':
    case 'false':
      return false;
    default:
      return true;
  }
}
