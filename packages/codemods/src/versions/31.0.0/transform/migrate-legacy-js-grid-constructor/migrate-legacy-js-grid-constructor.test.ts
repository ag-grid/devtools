import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { type CodemodFsUtils } from '@ag-grid-devtools/types';
import { fs as memfs } from 'memfs';
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
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
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({ source: expected, errors: [] });
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
