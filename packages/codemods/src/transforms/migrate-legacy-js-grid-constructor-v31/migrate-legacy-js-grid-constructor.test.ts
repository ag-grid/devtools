import { transformFileAst } from '@ag-grid-devtools/codemod-utils';
import { createMockFsHelpers, fs as memfs } from '@ag-grid-devtools/test-utils';
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
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/esm/named-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createMockFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/esm/named-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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

    describe('Namespaced import', () => {
      test('local scope', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/esm/namespaced-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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
  });

  describe('CommonJS Modules', () => {
    describe('Named import', () => {
      test('local scope', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/cjs/named-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createMockFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/cjs/named-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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

    describe('Namespaced import', () => {
      test('local scope', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/cjs/namespaced-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createMockFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/cjs/namespaced-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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
  });

  describe('UMD Modules', () => {
    describe('Named import', () => {
      test('local scope', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/umd/named-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createMockFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/umd/named-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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

    describe('Namespaced import', () => {
      test('local scope', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/umd/namespaced-import/local-scope',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createMockFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('aliased import name', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/umd/namespaced-import/aliased-import-name',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFileAst(input, [migrateLegacyJsGridConstructor], {
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
  });
});
