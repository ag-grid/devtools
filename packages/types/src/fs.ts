export interface FsUtils {
  readFile(filename: string, encoding: 'utf-8'): Promise<string>;
  readFile(filename: string, encoding: BufferEncoding): Promise<string | Buffer>;
  readFileSync(filename: string, encoding: 'utf-8'): string;
  readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  writeFile(filename: string, data: string | Buffer): Promise<void>;
  writeFileSync(filename: string, data: string | Buffer): void;
}
