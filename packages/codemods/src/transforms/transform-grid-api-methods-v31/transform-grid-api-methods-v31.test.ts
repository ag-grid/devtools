import { transformFileAst } from '@ag-grid-devtools/codemod-utils';
import { createMockFsHelpers, fs as memfs } from '@ag-grid-devtools/test-utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import transformGridApiMethodsV31 from './transform-grid-api-methods-v31';

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
    const actual = transformFileAst(input, [transformGridApiMethodsV31], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createMockFsHelpers(memfs),
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
    const actual = transformFileAst(input, [transformGridApiMethodsV31], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createMockFsHelpers(memfs),
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
    const actual = transformFileAst(input, [transformGridApiMethodsV31], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createMockFsHelpers(memfs),
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
    const actual = transformFileAst(input, [transformGridApiMethodsV31], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createMockFsHelpers(memfs),
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
    const actual = transformFileAst(input, [transformGridApiMethodsV31], {
      filename: inputPath,
      applyDangerousEdits: false,
      fs: createMockFsHelpers(memfs),
    });
    expect(actual).toEqual({
      source: expected === input ? null : expected,
      errors,
    });
  });
});
