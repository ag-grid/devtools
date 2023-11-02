import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import renameGridApiMethods from './rename-grid-api-methods';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  test('const initializer', () => {
    const scenarioPath = join(__dirname, './scenarios/const-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const actual = transformFile(input, [renameGridApiMethods], {
      sourceFilename: inputPath,
      sourceType: 'module',
      applyDangerousEdits: false,
    });
    expect(actual).toEqual({ source: expected, errors: [] });
  });

  test('let initializer', () => {
    const scenarioPath = join(__dirname, './scenarios/let-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const actual = transformFile(input, [renameGridApiMethods], {
      sourceFilename: inputPath,
      sourceType: 'module',
      applyDangerousEdits: false,
    });
    expect(actual).toEqual({ source: expected, errors: [] });
  });

  test('let initializer (reassigned)', () => {
    const scenarioPath = join(__dirname, './scenarios/let-initializer-reassigned');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const actual = transformFile(input, [renameGridApiMethods], {
      sourceFilename: inputPath,
      sourceType: 'module',
      applyDangerousEdits: false,
    });
    expect(actual).toEqual({ source: expected, errors: [] });
  });

  test('var initializer', () => {
    const scenarioPath = join(__dirname, './scenarios/var-initializer');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const actual = transformFile(input, [renameGridApiMethods], {
      sourceFilename: inputPath,
      sourceType: 'module',
      applyDangerousEdits: false,
    });
    expect(actual).toEqual({ source: expected, errors: [] });
  });

  test('var initializer (reassigned)', () => {
    const scenarioPath = join(__dirname, './scenarios/var-initializer-reassigned');
    const inputPath = join(scenarioPath, 'input.js');
    const outputPath = join(scenarioPath, 'output.js');
    const input = readFileSync(inputPath, 'utf-8');
    const expected = readFileSync(outputPath, 'utf-8');
    const actual = transformFile(input, [renameGridApiMethods], {
      sourceFilename: inputPath,
      sourceType: 'module',
      applyDangerousEdits: false,
    });
    expect(actual).toEqual({ source: expected, errors: [] });
  });
});
