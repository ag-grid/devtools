import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { type FsUtils } from '@ag-grid-devtools/types';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fs as memfs, vol } from 'memfs';
import { afterEach, describe, expect, test } from 'vitest';

import migrateLegacyColumnApi from './migrate-legacy-column-api';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  describe('React', () => {
    test('Direct element ref access', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/direct-element-ref-access',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Aliased element ref', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/react/aliased-element-ref');
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Aliased element ref and aliased property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/aliased-element-ref-aliased-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Destructured element ref and aliased property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/destructured-element-ref-aliased-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Destructured element ref and destructured property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/destructured-element-ref-destructured-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Deeply destructured element ref property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/deeply-destructured-element-ref-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
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

  describe('Angular', () => {
    test('Type-based element binding', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/type-based-element-binding',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('ID-based element binding', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/id-based-element-binding',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    describe('External template files', () => {
      afterEach(() => {
        vol.reset();
      });

      test('Supports external template file', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/external-template-file',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const inputTemplatePath = join(scenarioPath, 'input.component.html');
        const outputTemplatePath = join(scenarioPath, 'output.component.html');
        const inputTemplate = readFileSync(inputTemplatePath, 'utf-8');
        const outputTemplate = readFileSync(outputTemplatePath, 'utf-8');
        vol.fromJSON({
          [inputTemplatePath]: inputTemplate,
        });
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
        expect(vol.toJSON()).toEqual({
          [inputTemplatePath]: outputTemplate,
        });
      });
    });

    test('Direct event property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/direct-event-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Destructured event property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/destructured-event-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Aliased event property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/aliased-event-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test.skip('Destructured event argument', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/destructured-event-argument',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test.skip('Aliased destructured event argument', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/aliased-destructured-event-argument',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Aliased destructured event property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/aliased-destructured-event-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('Instance field event property accessor', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/angular/instance-field-event-property-accessor',
      );
      const inputPath = join(scenarioPath, 'input.component.ts');
      const outputPath = join(scenarioPath, 'output.component.ts');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [migrateLegacyColumnApi], {
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

  describe('Vue', () => {
    describe('JS components', () => {
      test('Direct event property accessor', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/js/direct-event-property-accessor',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test.skip('Destructured event argument', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/js/destructured-event-argument',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test.skip('Aliased destructured event argument', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/js/destructured-event-argument',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('Component field event property accessor', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/js/component-field-event-property-accessor',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
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

    describe('SFC components', () => {
      test('Direct event property accessor', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/sfc/direct-event-property-accessor',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test.skip('Destructured event argument', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/sfc/destructured-event-argument',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test.skip('Aliased destructured event argument', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/sfc/destructured-event-argument',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('Component field event property accessor', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/sfc/component-field-event-property-accessor',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [migrateLegacyColumnApi], {
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
