import { createMockFsHelpers, fs as memfs, vol } from '@ag-grid-devtools/test-utils';
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
            fs: createMockFsHelpers(memfs),
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
            fs: createMockFsHelpers(memfs),
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
              fs: createMockFsHelpers(memfs),
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
              fs: createMockFsHelpers(memfs),
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
              fs: createMockFsHelpers(memfs),
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
              fs: createMockFsHelpers(memfs),
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
            fs: createMockFsHelpers(memfs),
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
            fs: createMockFsHelpers(memfs),
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
      fs: createMockFsHelpers(memfs),
    },
  );
  expect(actual).toEqual({
    source: expected === input ? null : expected,
    errors,
  });
});
