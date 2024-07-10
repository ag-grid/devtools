import { spawn, type ProcessEnvOptions } from 'node:child_process';

export function execCommand(
  command: string,
  args: Array<string>,
  options?: ProcessEnvOptions,
): PromiseLike<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    const stdoutChunks: Array<Buffer> = [];
    const stderrChunks: Array<Buffer> = [];
    childProcess.stdout.on('data', (chunk) => stdoutChunks.push(chunk));
    childProcess.stderr.on('data', (chunk) => stderrChunks.push(chunk));
    childProcess.on('error', reject);
    childProcess.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve({
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: Buffer.concat(stderrChunks).toString('utf8'),
        });
      } else {
        const error = new Error(
          `Command "${command} ${args.join(' ')}" exited with code ${exitCode}`,
        );
        try {
          (error as any).stderr = Buffer.concat(stderrChunks).toString('utf8');
        } catch {}
        reject(error);
      }
    });
  });
}
