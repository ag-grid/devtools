import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { type CodemodFsUtils } from '@ag-grid-devtools/types';
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
  describe('object assignment', () => {
    test('destructured', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/destructured',
      );
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

    test('destructured (deep)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/destructured-deep',
      );
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

    test('destructured (nested)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/destructured-nested',
      );
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

    test('destructured (repeated)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/destructured-repeated',
      );
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

    test('destructured (shallow)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/destructured-shallow',
      );
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

    test('member accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/member-accessor',
      );
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

    test('member accessor (deep)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/member-accessor-deep',
      );
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

    test('member accessor (lazy initializer)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/member-accessor-lazy-initializer',
      );
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

    test('member accessor (lazy initializer, deep)', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/object-assignment/member-accessor-lazy-initializer-deep',
      );
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
});

function createFsHelpers(fs: typeof memfs): CodemodFsUtils {
  return {
    readFileSync,
    writeFileSync,
  };

  function readFileSync(filename: string, encoding: 'utf-8'): string;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer;
  function readFileSync(filename: string, encoding: BufferEncoding): string | Buffer {
    return fs.readFileSync(filename, encoding);
  }

  function writeFileSync(filename: string, data: string | Buffer): void {
    return fs.writeFileSync(filename, data);
  }
}
