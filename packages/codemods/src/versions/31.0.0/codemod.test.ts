import { type FsUtils } from '@ag-grid-devtools/types';
import { fs as memfs, vol } from 'memfs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';

import codemod from './codemod';

const __dirname = dirname(fileURLToPath(import.meta.url));

function toCrlf(input: string): string {
  return (input.endsWith('\n') ? input.slice(0, -1) : input).split('\n').join('\r\n');
}

describe('Retains line endings', () => {
  describe('CRLF', () => {
    describe('JavaScript source files', () => {
      test('No modifications', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/crlf/javascript/no-modifications',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = toCrlf(readFileSync(inputPath, 'utf-8'));
        const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
        const errors = require(errorsPath);
        const actual = codemod(
          { path: inputPath, source: input },
          {
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('Modifications', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/crlf/javascript/modifications',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = toCrlf(readFileSync(inputPath, 'utf-8'));
        const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
        const errors = require(errorsPath);
        const actual = codemod(
          { path: inputPath, source: input },
          {
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });
    });

    describe('Angular source files', () => {
      describe('Inline template', () => {
        test('No modifications', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/crlf/angular/inline-template/no-modifications',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = toCrlf(readFileSync(inputPath, 'utf-8'));
          const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
          const errors = require(errorsPath);
          const actual = codemod(
            { path: inputPath, source: input },
            {
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            },
          );
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('Modifications', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/crlf/angular/inline-template/modifications',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = toCrlf(readFileSync(inputPath, 'utf-8'));
          const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
          const errors = require(errorsPath);
          const actual = codemod(
            { path: inputPath, source: input },
            {
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            },
          );
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });
      });

      describe('External template file', () => {
        afterEach(() => {
          vol.reset();
        });

        test('No modifications', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/crlf/angular/external-template/no-modifications',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const inputTemplatePath = join(scenarioPath, 'input.component.html');
          const outputTemplatePath = join(scenarioPath, 'output.component.html');
          const inputTemplate = toCrlf(readFileSync(inputTemplatePath, 'utf-8'));
          const outputTemplate = toCrlf(readFileSync(outputTemplatePath, 'utf-8'));
          vol.fromJSON({
            [inputTemplatePath]: inputTemplate,
          });
          const input = toCrlf(readFileSync(inputPath, 'utf-8'));
          const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
          const errors = require(errorsPath);
          const actual = codemod(
            { path: inputPath, source: input },
            {
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            },
          );
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
          expect(vol.toJSON()).toEqual({
            [inputTemplatePath]: outputTemplate,
          });
        });

        test('Modifications', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/crlf/angular/external-template/modifications',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const inputTemplatePath = join(scenarioPath, 'input.component.html');
          const outputTemplatePath = join(scenarioPath, 'output.component.html');
          const inputTemplate = toCrlf(readFileSync(inputTemplatePath, 'utf-8'));
          const outputTemplate = toCrlf(readFileSync(outputTemplatePath, 'utf-8'));
          vol.fromJSON({
            [inputTemplatePath]: inputTemplate,
          });
          const input = toCrlf(readFileSync(inputPath, 'utf-8'));
          const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
          const errors = require(errorsPath);
          const actual = codemod(
            { path: inputPath, source: input },
            {
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            },
          );
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
          expect(vol.toJSON()).toEqual({
            [inputTemplatePath]: outputTemplate,
          });
        });
      });
    });

    describe('Vue source files', () => {
      test('No modifications', () => {
        const scenarioPath = join(__dirname, './__fixtures__/scenarios/crlf/vue/no-modifications');
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = toCrlf(readFileSync(inputPath, 'utf-8'));
        const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
        const errors = require(errorsPath);
        const actual = codemod(
          { path: inputPath, source: input },
          {
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('Modifications', () => {
        const scenarioPath = join(__dirname, './__fixtures__/scenarios/crlf/vue/modifications');
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = toCrlf(readFileSync(inputPath, 'utf-8'));
        const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
        const errors = require(errorsPath);
        const actual = codemod(
          { path: inputPath, source: input },
          {
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });
    });
  });
});

test('Supports legacy TypeScript cast expressions in non-TSX files', () => {
  const scenarioPath = join(__dirname, './__fixtures__/scenarios/cast-expressions');
  const inputPath = join(scenarioPath, 'input.ts');
  const outputPath = join(scenarioPath, 'output.ts');
  const errorsPath = join(scenarioPath, 'output.errors.cjs');
  const input = toCrlf(readFileSync(inputPath, 'utf-8'));
  const expected = toCrlf(readFileSync(outputPath, 'utf-8'));
  const errors = require(errorsPath);
  const actual = codemod(
    { path: inputPath, source: input },
    {
      applyDangerousEdits: false,
      fs: createFsHelpers(memfs),
    },
  );
  expect(actual).toEqual({
    source: expected === input ? null : expected,
    errors,
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
