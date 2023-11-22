import { type CliOptions } from '../types/cli';
import { red } from './stdio';

export class CliError extends Error {
  public info: string | undefined;

  constructor(message: string, info?: string) {
    super(message);
    this.name = 'CliError';
    this.info = info;
  }

  toString(env?: CliOptions['env']) {
    return `${env ? red('Error', env) : 'Error'}: ${this.message}\n\n${this.info}`;
  }
}

export class CliArgsError extends CliError {
  constructor(message: string, usage: string | undefined) {
    super(message, usage);
    this.name = 'CliArgsError';
  }
}
