import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { type FsUtils } from '@ag-grid-devtools/types';
import { fs as memfs, vol } from 'memfs';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, test } from 'vitest';

import renameGridOptions from './rename-grid-options';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  describe('Plain JS', () => {
    describe('advancedFilterModel', () => {
      test('undefined value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/advanced-filter-model/undefined',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('null value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/advanced-filter-model/null',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/advanced-filter-model/static',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/advanced-filter-model/dynamic',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    test('defaultExcelExportParams', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/default-excel-export-params',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    describe('enableChartToolPanelsButton', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/enable-chart-tool-panels-button/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/enable-chart-tool-panels-button/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    test('enterMovesDown', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/enter-moves-down');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('excludeHiddenColumnsFromQuickFilter', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/exclude-hidden-columns-from-quick-filter',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('functionsPassive', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/functions-passive');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    test('getServerSideStoreParams', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/get-server-side-store-params',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('onColumnChangeRequest', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/on-column-change-request');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    test('onRowDataChanged', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/on-row-data-changed');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('processSecondaryColDef', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/process-secondary-col-def');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('processSecondaryColGroupDef', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/process-secondary-col-group-def',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('rememberGroupStateWhenNewData', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/remember-group-state-when-new-data',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    test('rowDataChangeDetectionStrategy', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/row-data-change-detection-strategy',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    describe('serverSideFilterAllLevels', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/server-side-filter-all-levels/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/server-side-filter-all-levels/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    test('serverSideFilteringAlwaysResets', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/server-side-filtering-always-resets',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('serverSideSortingAlwaysResets', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/server-side-sorting-always-resets',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    describe('serverSideStoreType', () => {
      describe('full', () => {
        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/js/server-side-store-type/full/static-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/js/server-side-store-type/full/dynamic-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('partial', () => {
        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/js/server-side-store-type/partial/static-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/js/server-side-store-type/partial/dynamic-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

    describe('suppressAggAtRootLevel', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/suppress-agg-at-root-level/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/js/suppress-agg-at-root-level/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    test('suppressAsyncEvents', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/js/suppress-async-events');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    test('suppressParentsInRowNodes', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/js/suppress-parents-in-row-nodes',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });
  });

  describe('React', () => {
    describe('advancedFilterModel', () => {
      test('undefined value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/advanced-filter-model/undefined',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('null value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/advanced-filter-model/null',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/advanced-filter-model/static',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('property value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/advanced-filter-model/property',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    describe('enableChartToolPanelsButton', () => {
      test('undefined value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/undefined',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('null value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/null',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('false value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/false',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('true value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/true',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('shorthand value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/shorthand',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('property value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/property',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enable-chart-tool-panels-button/dynamic',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    describe('enterMovesDown', () => {
      test('undefined value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/undefined',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('null value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/null',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('false value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/false',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('true value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/true',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('shorthand value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/shorthand',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('property value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/property',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/enter-moves-down/dynamic',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
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

    test('onColumnRowGroupChangeRequest', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/on-column-row-group-change-request',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    test('onRowDataChanged', () => {
      const scenarioPath = join(__dirname, './__fixtures__/scenarios/react/on-row-data-changed');
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      const actual = transformFile(input, [renameGridOptions], {
        filename: inputPath,
        applyDangerousEdits: false,
        fs: createFsHelpers(memfs),
      });
      expect(actual).toEqual({
        source: expected === input ? null : expected,
        errors,
      });
    });

    test('rowDataChangeDetectionStrategy', () => {
      const scenarioPath = join(
        __dirname,
        './__fixtures__/scenarios/react/row-data-change-detection-strategy',
      );
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const errorsPath = join(scenarioPath, 'output.errors.cjs');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const errors = require(errorsPath);
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: null,
          errors,
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: true,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors: [],
        });
      }
    });

    describe('suppressReactUi', () => {
      test('shorthand', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/suppress-react-ui/shorthand',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
        }
      });

      test('boolean', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/react/suppress-react-ui/boolean',
        );
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
        }
      });
    });
  });

  describe('Angular', () => {
    describe('Inline template', () => {
      test('Unrelated components', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/inline-template/unrelated-components',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      describe('advancedFilterModel', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/advanced-filter-model/undefined',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/advanced-filter-model/null',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/advanced-filter-model/static',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/advanced-filter-model/property',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enableChartToolPanelsButton', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/undefined',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/null',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/false',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/true',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/shorthand',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/property',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enable-chart-tool-panels-button/dynamic',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enterMovesDown', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/undefined',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/null',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/false',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/true',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/shorthand',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/property',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/enter-moves-down/dynamic',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      test('onColumnRowGroupChangeRequest', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/inline-template/on-column-row-group-change-request',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
        }
      });

      test('onRowDataChanged', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/inline-template/on-row-data-changed',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      describe('rowDataChangeDetectionStrategy', () => {
        test('literal value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/inline-template/row-data-change-detection-strategy/literal',
          );
          const inputPath = join(scenarioPath, 'input.component.ts');
          const outputPath = join(scenarioPath, 'output.component.ts');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: null,
              errors,
            });
          }
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: true,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: expected === input ? null : expected,
              errors: [],
            });
          }
        });
      });
    });

    describe('External template file', () => {
      afterEach(() => {
        vol.reset();
      });

      test('Unrelated components', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/external-template/unrelated-components',
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
        const actual = transformFile(input, [renameGridOptions], {
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

      describe('advancedFilterModel', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/advanced-filter-model/undefined',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/advanced-filter-model/null',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/advanced-filter-model/static',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/advanced-filter-model/property',
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
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enableChartToolPanelsButton', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/undefined',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/null',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/false',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/true',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/shorthand',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/property',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enable-chart-tool-panels-button/dynamic',
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
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enterMovesDown', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/undefined',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/null',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/false',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/true',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/shorthand',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/property',
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
          const actual = transformFile(input, [renameGridOptions], {
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

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/enter-moves-down/dynamic',
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
          const actual = transformFile(input, [renameGridOptions], {
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

      test('onColumnRowGroupChangeRequest', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/external-template/on-column-row-group-change-request',
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
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
          expect(vol.toJSON()).toEqual({
            [inputTemplatePath]: inputTemplate,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
          expect(vol.toJSON()).toEqual({
            [inputTemplatePath]: outputTemplate,
          });
        }
      });

      test('onRowDataChanged', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/angular/external-template/on-row-data-changed',
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
        const actual = transformFile(input, [renameGridOptions], {
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

      describe('rowDataChangeDetectionStrategy', () => {
        test('literal value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/angular/external-template/row-data-change-detection-strategy/literal',
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
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: null,
              errors,
            });
            expect(vol.toJSON()).toEqual({
              [inputTemplatePath]: inputTemplate,
            });
          }
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: true,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: expected === input ? null : expected,
              errors: [],
            });
            expect(vol.toJSON()).toEqual({
              [inputTemplatePath]: outputTemplate,
            });
          }
        });
      });
    });
  });

  describe('Vue', () => {
    describe('JS components', () => {
      describe('advancedFilterModel', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/advanced-filter-model/undefined',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/advanced-filter-model/null',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/advanced-filter-model/property',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/advanced-filter-model/static',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enableChartToolPanelsButton', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/undefined',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/null',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/false',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/true',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/shorthand',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/property',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enable-chart-tool-panels-button/dynamic',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      describe('enterMovesDown', () => {
        test('undefined value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/undefined',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('null value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/null',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('false value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/false',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('true value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/true',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('shorthand value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/shorthand',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('property value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/property',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors,
          });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/enter-moves-down/dynamic',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      test('onColumnRowGroupChangeRequest', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/js/on-column-row-group-change-request',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
        }
      });

      test('onRowDataChanged', () => {
        const scenarioPath = join(__dirname, './__fixtures__/scenarios/vue/js/on-row-data-changed');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        const actual = transformFile(input, [renameGridOptions], {
          filename: inputPath,
          applyDangerousEdits: false,
          fs: createFsHelpers(memfs),
        });
        expect(actual).toEqual({
          source: expected === input ? null : expected,
          errors,
        });
      });

      describe('rowDataChangeDetectionStrategy', () => {
        test('literal value', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/js/row-data-change-detection-strategy/literal',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: false,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: null,
              errors,
            });
          }
          {
            const actual = transformFile(input, [renameGridOptions], {
              filename: inputPath,
              applyDangerousEdits: true,
              fs: createFsHelpers(memfs),
            });
            expect(actual).toEqual({
              source: expected === input ? null : expected,
              errors: [],
            });
          }
        });
      });
    });

    describe('SFC components', () => {
      describe('advancedFilterModel', () => {
        test('specified', () => {
          const scenarioPath = join(
            __dirname,
            './__fixtures__/scenarios/vue/sfc/advanced-filter-model/specified',
          );
          const inputPath = join(scenarioPath, 'input.vue');
          const outputPath = join(scenarioPath, 'output.vue');
          const errorsPath = join(scenarioPath, 'output.errors.cjs');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const errors = require(errorsPath);
          const actual = transformFile(input, [renameGridOptions], {
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

      test('rowDataChangeDetectionStrategy', () => {
        const scenarioPath = join(
          __dirname,
          './__fixtures__/scenarios/vue/sfc/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const errorsPath = join(scenarioPath, 'output.errors.cjs');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const errors = require(errorsPath);
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: false,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: null,
            errors,
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            filename: inputPath,
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          });
          expect(actual).toEqual({
            source: expected === input ? null : expected,
            errors: [],
          });
        }
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
