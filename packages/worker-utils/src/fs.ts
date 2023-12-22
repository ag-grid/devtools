import { FsUtils } from '@ag-grid-devtools/types';
import gracefulFs from 'graceful-fs';
import { promisify } from 'node:util';

const promises = {
  readFile: promisify(gracefulFs.readFile),
  writeFile: promisify(gracefulFs.writeFile),
};

export function createFsHelpers(fs: typeof gracefulFs = gracefulFs): FsUtils {
  return {
    readFile,
    readFileSync,
    writeFile,
    writeFileSync,
  };

  function readFile(filename: string, encoding: 'utf-8'): Promise<string>;
  function readFile(filename: string, encoding: BufferEncoding): Promise<string | Buffer>;
  function readFile(filename: string, encoding: BufferEncoding): Promise<string | Buffer> {
    return promises.readFile(filename, encoding);
  }

  function readFileSync(filename: string, encoding: 'utf-8'): string;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer {
    return fs.readFileSync(filename, encoding);
  }

  function writeFile(filename: string, data: string | Buffer): Promise<void> {
    return promises.writeFile(filename, data);
  }

  function writeFileSync(filename: string, data: string | Buffer): void {
    return fs.writeFileSync(filename, data);
  }
}
