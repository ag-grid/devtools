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
    env: { INPUT_FILE, DRY_RUN, APPLY_DANGEROUS_EDITS },
  } = env;
  if (!INPUT_FILE) throw new Error('Missing INPUT_FILE environment variable');
  const inputFilePath = INPUT_FILE;
  const dryRun = parseBooleanEnvVar(DRY_RUN);
  const applyDangerousEdits = parseBooleanEnvVar(APPLY_DANGEROUS_EDITS);
  return {
    inputFilePath,
    dryRun,
    applyDangerousEdits,
  };
}

function parseWorkerThreadTaskInput(data: unknown): CodemodTaskInput {
  if (!data || typeof data !== 'object') throw new Error('Invalid task input');
  const { inputFilePath, dryRun, applyDangerousEdits } = data as Record<string, unknown>;
  if (typeof inputFilePath !== 'string') {
    throw new Error(`Invalid inputFilePath field value: ${JSON.stringify(inputFilePath)}`);
  }
  if (typeof dryRun !== 'boolean') {
    throw new Error(`Invalid dryRun field value: ${JSON.stringify(dryRun)}`);
  }
  if (typeof applyDangerousEdits !== 'boolean') {
    throw new Error(
      `Invalid applyDangerousEdits field value: ${JSON.stringify(applyDangerousEdits)}`,
    );
  }
  return {
    inputFilePath,
    dryRun: Boolean(dryRun),
    applyDangerousEdits: Boolean(applyDangerousEdits),
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
