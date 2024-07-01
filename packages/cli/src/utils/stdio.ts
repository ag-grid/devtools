import { CliOptions } from '../types/cli';
import { WritableStream } from '../types/io';
import { CliError } from './cli';

export function log(output: WritableStream, text: string): Promise<void> {
  return new Promise((resolve, reject) =>
    output.write(`${text}\n`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    }),
  );
}

export function indentErrorMessage(error: any, options: { indent: string }) {
  const message =
    error instanceof CliError
      ? error.toString()
      : error instanceof Error
        ? error.stack || error.message
        : String(error);
  return indentString(message, options);
}

function indentString(value: string, options: { indent: string }): string {
  const { indent } = options;
  return indent + value.replace(/\n/g, '\n' + indent);
}

export function green(message: string, env: CliOptions['env']): string {
  return ansiText('32', message, env);
}

export function red(message: string, env: CliOptions['env']): string {
  return ansiText('31', message, env);
}

function ansiText(ansiCode: string, message: string, env: CliOptions['env']): string {
  // Avoid ANSI escape codes if NO_COLOR environment variable is set
  if (env.NO_COLOR && env.NO_COLOR !== '0') return message;
  // ANSI escape code for styled text
  return `\x1b[${ansiCode}m${message}\x1b[0m`;
}
