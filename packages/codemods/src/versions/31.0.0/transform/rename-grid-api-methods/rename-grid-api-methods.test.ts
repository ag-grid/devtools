import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { type FsUtils } from '@ag-grid-devtools/types';
import { fs as memfs } from 'memfs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import renameGridApiMethods from './rename-grid-api-methods';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  test('const initializer', () => {
    const scenarioPath = join(__dirname, './__fixtures__/scenarios/const-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const errorsPath = join(scenarioPath, 'output.errors.cjs');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const errors = require(errorsPath);
    const actual = transformFile(input, [renameGridApiMethods], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });

  test('let initializer', () => {
    const scenarioPath = join(__dirname, './__fixtures__/scenarios/let-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const errorsPath = join(scenarioPath, 'output.errors.cjs');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const errors = require(errorsPath);
    const actual = transformFile(input, [renameGridApiMethods], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });

  test('let initializer (reassigned)', () => {
    const scenarioPath = join(__dirname, './__fixtures__/scenarios/let-initializer-reassigned');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const errorsPath = join(scenarioPath, 'output.errors.cjs');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const errors = require(errorsPath);
    const actual = transformFile(input, [renameGridApiMethods], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });

  test('var initializer', () => {
    const scenarioPath = join(__dirname, './__fixtures__/scenarios/var-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const errorsPath = join(scenarioPath, 'output.errors.cjs');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const errors = require(errorsPath);
    const actual = transformFile(input, [renameGridApiMethods], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });

  test('var initializer (reassigned)', () => {
    const scenarioPath = join(__dirname, './__fixtures__/scenarios/var-initializer-reassigned');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const errorsPath = join(scenarioPath, 'output.errors.cjs');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const errors = require(errorsPath);
    const actual = transformFile(input, [renameGridApiMethods], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });
});

function createFsHelpers(fs: typeof memfs): FsUtils {
  return {
    readFile,
    readFileSync,
    writeFile,
    writeFileSync,
  };

  function readFile(filename: string, encoding: 'utf-8'): Promise<string>;
  function readFile(filename: string, encoding: BufferEncoding): Promise<string | Buffer>;
  function readFile(filename: string, encoding: BufferEncoding): Promise<string | Buffer> {
    return fs.promises.readFile(filename, encoding);
  }

  function readFileSync(filename: string, encoding: 'utf-8'): string;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer {
    return fs.readFileSync(filename, encoding);
  }

  function writeFile(filename: string, data: string | Buffer): Promise<void> {
    return fs.promises.writeFile(filename, data);
  }

  function writeFileSync(filename: string, data: string | Buffer): void {
    return fs.writeFileSync(filename, data);
  }
}
