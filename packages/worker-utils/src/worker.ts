import {
  type MainTaskConfig,
  type Task,
  type TaskRunnerEnvironment,
  type WorkerTaskConfig,
} from '@ag-grid-devtools/types';
import { isMainThread, parentPort } from 'node:worker_threads';

export function configureWorkerTask<T extends Task<I, O>, I, O>(
  task: T,
  config: {
    main: MainTaskConfig<I>['parseEnvironment'];
    worker: WorkerTaskConfig<I>['parseIncomingMessage'];
  },
): T & MainTaskConfig<I> & WorkerTaskConfig<I> {
  const { main, worker } = config;
  return Object.create(task, {
    parseEnvironment: {
      value: main,
    },
    parseIncomingMessage: {
      value: worker,
    },
  });
}

export function initTaskWorker<I, O>(
  task: Task<I, O> & MainTaskConfig<I> & WorkerTaskConfig<I>,
  runner: TaskRunnerEnvironment,
): void {
  const channel = parentPort;
  if (isMainThread || !channel) {
    runProcessTask(task, process, runner).then(
      (result) => process.stdout.write(`${JSON.stringify(result)}\n`, () => process.exit(0)),
      (error) => {
        console.error(error);
        process.exit(1);
      },
    );
  } else {
    channel.on('message', (data: unknown) => {
      runWorkerTask(task, data, runner)
        .then(
          (result) => ({ success: true as const, value: result }),
          (error) => ({ success: false as const, error: serializeWorkerError(error) }),
        )
        .then((output) => channel.postMessage(output));
    });
  }
}

function runProcessTask<I, O>(
  task: Task<I, O> & MainTaskConfig<I>,
  process: NodeJS.Process,
  runner: TaskRunnerEnvironment,
): Promise<O> {
  try {
    const { argv, env } = process;
    const input = task.parseEnvironment({ argv, env });
    return task.run(input, runner);
  } catch (error) {
    return Promise.reject(error);
  }
}

function runWorkerTask<I, O>(
  task: Task<I, O> & WorkerTaskConfig<I>,
  data: unknown,
  runner: TaskRunnerEnvironment,
): Promise<O> {
  try {
    const input = task.parseIncomingMessage(data);
    return task.run(input, runner);
  } catch (error) {
    return Promise.reject(error);
  }
}

export function serializeWorkerError(error: unknown): Error {
  if (error instanceof Error) {
    if (isSerializable(error)) return error;
    const { name, message, stack, ...properties } = error;
    return Object.assign(new Error(message), {
      name,
      stack,
      ...properties,
    });
  }
  return new Error(String(error));
}

function isSerializable(value: unknown): boolean {
  try {
    structuredClone(value);
    return true;
  } catch {
    return false;
  }
}
