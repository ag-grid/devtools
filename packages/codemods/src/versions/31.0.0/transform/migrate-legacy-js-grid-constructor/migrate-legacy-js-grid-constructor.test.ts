import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import migrateLegacyJsGridConstructor from './migrate-legacy-js-grid-constructor';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  describe('ES Modules', () => {
    describe('Named import', () => {
      test('local scope', () => {
        const scenarioPath = join(__dirname, './scenarios/esm/named-import/local-scope');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('aliased import name', () => {
        const scenarioPath = join(__dirname, './scenarios/esm/named-import/aliased-import-name');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    describe('Namespaced import', () => {
      test('local scope', () => {
        const scenarioPath = join(__dirname, './scenarios/esm/namespaced-import/local-scope');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });
  });

  describe('CommonJS Modules', () => {
    describe('Named import', () => {
      test('local scope', () => {
        const scenarioPath = join(__dirname, './scenarios/cjs/named-import/local-scope');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('aliased import name', () => {
        const scenarioPath = join(__dirname, './scenarios/cjs/named-import/aliased-import-name');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    describe('Namespaced import', () => {
      test('local scope', () => {
        const scenarioPath = join(__dirname, './scenarios/cjs/namespaced-import/local-scope');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/cjs/namespaced-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [migrateLegacyJsGridConstructor], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });
  });
});
