import {
  Enum,
  EnumOptions,
  EnumVariant,
  instantiateEnum,
  isEnumVariant,
  nonNull,
} from '@ag-grid-devtools/utils';
import { Worker } from 'node:worker_threads';
export { Worker } from 'node:worker_threads';

export type WorkerResult<T> =
  | { success: true; value: T; stats: WorkerTaskStats }
  | { success: false; error: any; stats: WorkerTaskStats };

export interface WorkerTaskStats {
  queuedAt: number;
  startTime: number;
  endTime: number;
  runningTime: number;
  totalTime: number;
}

type WorkerState<I, O> = Enum<{
  [WorkerStatus.Idle]: void;
  [WorkerStatus.Running]: {
    input: I;
    resolver: TaskResolver<O> | undefined;
    queuedTime: number;
    startTime: number;
    onSuccess: TaskSuccessCallback | undefined;
    onError: TaskErrorCallback | undefined;
    onComplete: TaskCompleteCallback | undefined;
  };
}>;

const enum WorkerStatus {
  Idle,
  Running,
}

const WorkerState = {
  Idle: Object.assign(
    <I, O>(options: EnumOptions<WorkerState<I, O>, WorkerStatus.Idle>): WorkerState<I, O> =>
      instantiateEnum(WorkerStatus.Idle, options),
    {
      is: <I, O>(
        state: WorkerState<I, O>,
      ): state is EnumVariant<WorkerState<I, O>, WorkerStatus.Idle> =>
        isEnumVariant(state, WorkerStatus.Idle),
    },
  ),
  Running: Object.assign(
    <I, O>(options: EnumOptions<WorkerState<I, O>, WorkerStatus.Running>): WorkerState<I, O> =>
      instantiateEnum(WorkerStatus.Running, options),
    {
      is: <I, O>(
        state: WorkerState<I, O>,
      ): state is EnumVariant<WorkerState<I, O>, WorkerStatus.Running> =>
        isEnumVariant(state, WorkerStatus.Running),
    },
  ),
};

interface QueuedWorkerJob<I, O> {
  input: I;
  queuedTime: number;
  resolver: TaskResolver<O> | undefined;
  onStart: TaskStartCallback | undefined;
  onSuccess: TaskSuccessCallback | undefined;
  onError: TaskErrorCallback | undefined;
  onComplete: TaskCompleteCallback | undefined;
}

interface TaskResolver<T> {
  resolve: (value: WorkerResult<T>) => void;
  reject: (error: any) => void;
}

type TaskQueueCallback = (stats: { queuedAt: number }) => void;
type TaskStartCallback = (stats: { queuedAt: number; startedAt: number }) => void;
type TaskSuccessCallback = (stats: WorkerTaskStats) => void;
type TaskErrorCallback = (stats: WorkerTaskStats) => void;
type TaskCompleteCallback = (stats: WorkerTaskStats & { success: boolean }) => void;

interface WorkerSlot<I, O> {
  worker: Worker;
  state: WorkerState<I, O>;
}

export class WorkerTaskQueue<I, O> {
  private workers: Array<WorkerSlot<I, O>>;
  private queue: Array<QueuedWorkerJob<I, O>> = [];
  private terminated = false;

  public constructor(workers: Array<Worker>) {
    this.workers = workers.map((worker) => ({ worker, state: WorkerState.Idle({}) }));
  }

  public run(
    input: I,
    options?: {
      onQueue?: TaskQueueCallback;
      onStart?: TaskStartCallback;
      onSuccess?: TaskSuccessCallback;
      onError?: TaskErrorCallback;
      onComplete?: TaskCompleteCallback;
    },
  ): Promise<O> {
    if (this.terminated) throw new Error('This worker pool has been terminated');
    const {
      onQueue = undefined,
      onStart = undefined,
      onSuccess = undefined,
      onError = undefined,
      onComplete = undefined,
    } = options || {};
    const queuedTime = Date.now();
    const availableWorker = this.workers
      .map((slot) => (WorkerState.Idle.is(slot.state) ? slot : null))
      .find(nonNull);
    const callbacks = { onQueue, onStart, onSuccess, onError, onComplete };
    return (
      availableWorker
        ? createImmediateTask(availableWorker, input, queuedTime, callbacks, this.queue)
        : createQueuedTask(input, queuedTime, callbacks, this.queue)
    ).then((result) => {
      if (result.success) return result.value;
      throw result.error;
    });
  }

  public terminate(): void {
    if (this.terminated) return;
    this.terminated = true;
    for (const queuedJob of this.queue) {
      const { resolver, onError, onComplete, queuedTime } = queuedJob;
      if (onError || onComplete) {
        const startTime = Date.now();
        const endTime = startTime;
        const stats = {
          queuedAt: queuedTime,
          startTime,
          endTime,
          runningTime: 0,
          totalTime: 0,
        };
        if (onError) onError(stats);
        if (onComplete) onComplete({ success: false, ...stats });
      }
      if (resolver) resolver.reject(new Error('Worker terminated'));
    }
    for (const slot of this.workers) {
      slot.state = WorkerState.Idle({});
      slot.worker.terminate();
    }
  }
}

function createImmediateTask<I, O>(
  worker: WorkerSlot<I, O>,
  input: I,
  queuedTime: number,
  callbacks: {
    onStart: TaskStartCallback | undefined;
    onSuccess: TaskSuccessCallback | undefined;
    onError: TaskErrorCallback | undefined;
    onComplete: TaskCompleteCallback | undefined;
  },
  queue: Array<QueuedWorkerJob<I, O>>,
): Promise<WorkerResult<O>> {
  const startTime = queuedTime;
  worker.state = WorkerState.Running({
    input,
    resolver: undefined,
    queuedTime,
    startTime,
    onSuccess: callbacks.onSuccess,
    onError: callbacks.onError,
    onComplete: callbacks.onComplete,
  });
  if (callbacks.onStart) callbacks.onStart({ queuedAt: queuedTime, startedAt: startTime });
  return enqueueTask(worker, input, queuedTime, startTime, callbacks, queue);
}

function createQueuedTask<I, O>(
  input: I,
  queuedTime: number,
  callbacks: {
    onQueue: TaskQueueCallback | undefined;
    onStart: TaskStartCallback | undefined;
    onSuccess: TaskSuccessCallback | undefined;
    onError: TaskErrorCallback | undefined;
    onComplete: TaskCompleteCallback | undefined;
  },
  queue: Array<QueuedWorkerJob<I, O>>,
): Promise<WorkerResult<O>> {
  let resolver: TaskResolver<O>;
  const task = new Promise<WorkerResult<O>>((resolve, reject) => {
    resolver = { resolve, reject };
  });
  if (callbacks.onQueue) callbacks.onQueue({ queuedAt: queuedTime });
  const { onStart, onSuccess, onError, onComplete } = callbacks;
  queue.push({ input, queuedTime, resolver: resolver!, onStart, onSuccess, onError, onComplete });
  return task;
}

function enqueueTask<I, O>(
  slot: WorkerSlot<I, O>,
  input: I,
  queuedTime: number,
  startTime: number,
  callbacks: {
    onSuccess: TaskSuccessCallback | undefined;
    onError: TaskErrorCallback | undefined;
    onComplete: TaskCompleteCallback | undefined;
  },
  queue: Array<QueuedWorkerJob<I, O>>,
): Promise<WorkerResult<O>> {
  const { onSuccess, onError, onComplete } = callbacks;
  return runWorkerTask<I, O>(slot.worker, input)
    .then(
      (output) => {
        return { success: true as const, value: output };
      },
      (error) => {
        return { success: false as const, error };
      },
    )
    .then((result) => {
      const endTime = Date.now();
      const stats: WorkerTaskStats = {
        queuedAt: queuedTime,
        startTime,
        endTime,
        runningTime: endTime - startTime,
        totalTime: endTime - queuedTime,
      };
      if (result.success) {
        return { success: true as const, value: result.value, stats };
      } else {
        return { success: false as const, error: result.error, stats };
      }
    })
    .then((output) => {
      const queuedJob = queue.shift();
      if (queuedJob) {
        const { input, queuedTime, resolver, onStart, onSuccess, onError, onComplete } = queuedJob;
        const startTime = Date.now();
        slot.state = WorkerState.Running({
          input,
          resolver,
          queuedTime,
          startTime,
          onSuccess,
          onError,
          onComplete,
        });
        const callbacks = { onSuccess, onError, onComplete };
        const nextTask = enqueueTask(slot, input, queuedTime, startTime, callbacks, queue);
        if (resolver) nextTask.then(resolver.resolve, resolver.reject);
        notifyCallbacks();
        if (onStart) onStart({ queuedAt: queuedTime, startedAt: startTime });
      } else {
        slot.state = WorkerState.Idle({});
        notifyCallbacks();
      }
      return output;

      function notifyCallbacks() {
        if (!output.success && onError) onError(output.stats);
        if (output.success && onSuccess) onSuccess(output.stats);
        if (onComplete) onComplete({ success: output.success, ...output.stats });
      }
    });
}

function runWorkerTask<I, O>(worker: Worker, input: I): Promise<O> {
  return new Promise((resolve, reject) => {
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.on('exit', onExit);
    worker.postMessage(input);

    function onMessage(value: O) {
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.off('exit', onExit);
      resolve(value);
    }

    function onError(error: any) {
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.off('exit', onExit);
      reject(error);
    }

    function onExit(code: number) {
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.off('exit', onExit);
      reject(new Error(`Worker exited with code ${code}`));
    }
  });
}
