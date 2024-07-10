import { type FsUtils } from './fs';
import { UserConfig } from './user-config';

export interface Task<I, O> {
  run(input: I, runner: TaskRunnerEnvironment): Promise<O>;
}

export interface MainTaskConfig<T> {
  parseEnvironment(options: Pick<NodeJS.Process, 'argv' | 'env'>): T;
}

export interface WorkerTaskConfig<T> {
  parseIncomingMessage(data: unknown): T;
}

export interface TaskRunnerEnvironment {
  fs: FsUtils;
  userConfig: UserConfig | undefined;
}
