import { transformFile } from '@ag-grid-devtools/codemod-utils';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

import renameGridOptions from './rename-grid-options';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('transforms input files correctly', () => {
  describe('Plain JS', () => {
    describe('advancedFilterModel', () => {
      test('specified', () => {
        const scenarioPath = join(__dirname, './scenarios/js/advanced-filter-model/specified');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('unspecified', () => {
        const scenarioPath = join(__dirname, './scenarios/js/advanced-filter-model/unspecified');
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    test('defaultExcelExportParams', () => {
      const scenarioPath = join(__dirname, './scenarios/js/default-excel-export-params');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    describe('enableChartToolPanelsButton', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/enable-chart-tool-panels-button/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/enable-chart-tool-panels-button/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    test('enterMovesDown', () => {
      const scenarioPath = join(__dirname, './scenarios/js/enter-moves-down');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('excludeHiddenColumnsFromQuickFilter', () => {
      const scenarioPath = join(
        __dirname,
        './scenarios/js/exclude-hidden-columns-from-quick-filter',
      );
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('functionsPassive', () => {
      const scenarioPath = join(__dirname, './scenarios/js/functions-passive');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "functionsPassive" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   functionsPassive: true,
    |   ^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    test('getServerSideStoreParams', () => {
      const scenarioPath = join(__dirname, './scenarios/js/get-server-side-store-params');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('onColumnChangeRequest', () => {
      const scenarioPath = join(__dirname, './scenarios/js/on-column-change-request');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "onColumnRowGroupChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   5 |   columnDefs: [],
   6 |   rowData: [],
>  7 |   onColumnRowGroupChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |   onColumnPivotChangeRequest: () => {},
   9 |   onColumnValueChangeRequest: () => {},
  10 |   onColumnAggFuncChangeRequest: () => {},`),
            new SyntaxError(`The grid option "onColumnPivotChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   6 |   rowData: [],
   7 |   onColumnRowGroupChangeRequest: () => {},
>  8 |   onColumnPivotChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   9 |   onColumnValueChangeRequest: () => {},
  10 |   onColumnAggFuncChangeRequest: () => {},
  11 | });`),
            new SyntaxError(`The grid option "onColumnValueChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   7 |   onColumnRowGroupChangeRequest: () => {},
   8 |   onColumnPivotChangeRequest: () => {},
>  9 |   onColumnValueChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  10 |   onColumnAggFuncChangeRequest: () => {},
  11 | });
  12 |`),
            new SyntaxError(`The grid option "onColumnAggFuncChangeRequest" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   8 |   onColumnPivotChangeRequest: () => {},
   9 |   onColumnValueChangeRequest: () => {},
> 10 |   onColumnAggFuncChangeRequest: () => {},
     |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  11 | });
  12 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    test('onRowDataChanged', () => {
      const scenarioPath = join(__dirname, './scenarios/js/on-row-data-changed');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('processSecondaryColDef', () => {
      const scenarioPath = join(__dirname, './scenarios/js/process-secondary-col-def');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('processSecondaryColGroupDef', () => {
      const scenarioPath = join(__dirname, './scenarios/js/process-secondary-col-group-def');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('rememberGroupStateWhenNewData', () => {
      const scenarioPath = join(__dirname, './scenarios/js/remember-group-state-when-new-data');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "rememberGroupStateWhenNewData" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   rememberGroupStateWhenNewData: true,
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    test('rowDataChangeDetectionStrategy', () => {
      const scenarioPath = join(__dirname, './scenarios/js/row-data-change-detection-strategy');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   rowDataChangeDetectionStrategy: 'DeepEqualityCheck',
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    describe('serverSideFilterAllLevels', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/server-side-filter-all-levels/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/server-side-filter-all-levels/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    test('serverSideFilteringAlwaysResets', () => {
      const scenarioPath = join(__dirname, './scenarios/js/server-side-filtering-always-resets');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    test('serverSideSortingAlwaysResets', () => {
      const scenarioPath = join(__dirname, './scenarios/js/server-side-sorting-always-resets');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      const actual = transformFile(input, [renameGridOptions], {
        sourceFilename: inputPath,
        sourceType: 'module',
        applyDangerousEdits: false,
      });
      expect(actual).toEqual({ source: expected, errors: [] });
    });

    describe('serverSideStoreType', () => {
      describe('full', () => {
        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/js/server-side-store-type/full/static-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/js/server-side-store-type/full/dynamic-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        });
      });

      describe('partial', () => {
        test('static value', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/js/server-side-store-type/partial/static-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        });

        test('dynamic value', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/js/server-side-store-type/partial/dynamic-value',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        });
      });
    });

    describe('suppressAggAtRootLevel', () => {
      test('static value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/suppress-agg-at-root-level/static-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('dynamic value', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/js/suppress-agg-at-root-level/dynamic-value',
        );
        const inputPath = join(scenarioPath, 'input.js');
        const outputPath = join(scenarioPath, 'output.js');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    test('suppressAsyncEvents', () => {
      const scenarioPath = join(__dirname, './scenarios/js/suppress-async-events');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "suppressAsyncEvents" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   suppressAsyncEvents: true,
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    test('suppressParentsInRowNodes', () => {
      const scenarioPath = join(__dirname, './scenarios/js/suppress-parents-in-row-nodes');
      const inputPath = join(scenarioPath, 'input.js');
      const outputPath = join(scenarioPath, 'output.js');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "suppressParentsInRowNodes" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  5 |   columnDefs: [],
  6 |   rowData: [],
> 7 |   suppressParentsInRowNodes: true,
    |   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  8 | });
  9 |`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });
  });

  describe('React', () => {
    describe('advancedFilterModel', () => {
      test('specified', () => {
        const scenarioPath = join(__dirname, './scenarios/react/advanced-filter-model/specified');
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });

      test('aliased', () => {
        const scenarioPath = join(__dirname, './scenarios/react/advanced-filter-model/aliased');
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    test('rowDataChangeDetectionStrategy', () => {
      const scenarioPath = join(__dirname, './scenarios/react/row-data-change-detection-strategy');
      const inputPath = join(scenarioPath, 'input.jsx');
      const outputPath = join(scenarioPath, 'output.jsx');
      const input = readFileSync(inputPath, 'utf-8');
      const expected = readFileSync(outputPath, 'utf-8');
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   5 |   return (
   6 |     <div>
>  7 |       <AgGridReact columnDefs={[]} rowData={[]} rowDataChangeDetectionStrategy="DeepValueCheck" />
     |                                                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   8 |     </div>
   9 |   );
  10 | }`),
          ],
        });
      }
      {
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: true,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      }
    });

    describe('suppressReactUi', () => {
      test('shorthand', () => {
        const scenarioPath = join(__dirname, './scenarios/react/suppress-react-ui/shorthand');
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({
            source: null,
            errors: [
              new SyntaxError(`The grid option "suppressReactUi" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   5 |   return (
   6 |     <div>
>  7 |       <AgGridReact columnDefs={[]} rowData={[]} suppressReactUi />
     |                                                 ^^^^^^^^^^^^^^^
   8 |     </div>
   9 |   );
  10 | }`),
            ],
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: true,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        }
      });

      test('boolean', () => {
        const scenarioPath = join(__dirname, './scenarios/react/suppress-react-ui/boolean');
        const inputPath = join(scenarioPath, 'input.jsx');
        const outputPath = join(scenarioPath, 'output.jsx');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({
            source: null,
            errors: [
              new SyntaxError(`The grid option "suppressReactUi" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   5 |   return (
   6 |     <div>
>  7 |       <AgGridReact columnDefs={[]} rowData={[]} suppressReactUi={true} />
     |                                                 ^^^^^^^^^^^^^^^^^^^^^^
   8 |     </div>
   9 |   );
  10 | }`),
            ],
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: true,
          });
          expect(actual).toEqual({ source: expected, errors: [] });
        }
      });
    });
  });

  describe('Angular', () => {
    describe('Inline template', () => {
      test('Deprecation warning', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/angular/inline-template/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const input = readFileSync(inputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(
              'Angular components are not yet fully supported via codemods and may require manual fixes',
            ),
          ],
        });
      });

      test.skip('rowDataChangeDetectionStrategy', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/angular/inline-template/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    describe('External template', () => {
      test('Deprecation warning', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/angular/external-template/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const input = readFileSync(inputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: null,
          errors: [
            new SyntaxError(
              'Angular components are not yet fully supported via codemods and may require manual fixes',
            ),
          ],
        });
      });

      test.skip('rowDataChangeDetectionStrategy', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/angular/external-template/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.component.ts');
        const outputPath = join(scenarioPath, 'output.component.ts');
        const outputTemplatePath = join(scenarioPath, 'output.component.html');
        const input = readFileSync(inputPath, 'utf-8');
        const outputTemplate = readFileSync(outputTemplatePath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        const actual = transformFile(input, [renameGridOptions], {
          sourceFilename: inputPath,
          sourceType: 'module',
          applyDangerousEdits: false,
        });
        expect(actual).toEqual({
          source: expected,
          errors: [],
          files: {
            'input.component.html': outputTemplate,
          },
        });
      });
    });
  });

  describe('Vue', () => {
    describe('JS components', () => {
      describe('advancedFilterModel', () => {
        test('specified', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/vue/js/advanced-filter-model/specified',
          );
          const inputPath = join(scenarioPath, 'input.js');
          const outputPath = join(scenarioPath, 'output.js');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({
            source: expected,
            errors: [
              new SyntaxError(
                'Vue components are not yet fully supported via codemods and may require manual fixes',
              ),
            ],
          });
        });
      });
    });

    describe('SFC components', () => {
      describe('advancedFilterModel', () => {
        test('specified', () => {
          const scenarioPath = join(
            __dirname,
            './scenarios/vue/sfc/advanced-filter-model/specified',
          );
          const inputPath = join(scenarioPath, 'input.vue');
          const outputPath = join(scenarioPath, 'output.vue');
          const input = readFileSync(inputPath, 'utf-8');
          const expected = readFileSync(outputPath, 'utf-8');
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({
            source: expected,
            errors: [
              new SyntaxError(
                'Vue components are not yet fully supported via codemods and may require manual fixes',
              ),
            ],
          });
        });
      });

      test('rowDataChangeDetectionStrategy', () => {
        const scenarioPath = join(
          __dirname,
          './scenarios/vue/sfc/row-data-change-detection-strategy',
        );
        const inputPath = join(scenarioPath, 'input.vue');
        const outputPath = join(scenarioPath, 'output.vue');
        const input = readFileSync(inputPath, 'utf-8');
        const expected = readFileSync(outputPath, 'utf-8');
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: false,
          });
          expect(actual).toEqual({
            source: null,
            errors: [
              new SyntaxError(
                'Vue components are not yet fully supported via codemods and may require manual fixes',
              ),
              new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
   9 |       columnDefs: [],
  10 |       rowData: [],
> 11 |       rowDataChangeDetectionStrategy: 'DeepValueCheck',
     |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  12 |     };
  13 |   },
  14 |   methods: {`),
              new SyntaxError(`The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/
  14 |   methods: {
  15 |     onGridReady(params) {
> 16 |       this.rowDataChangeDetectionStrategy = 'DeepValueCheck';
     |       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  17 |     },
  18 |   },
  19 | };`),
              new SyntaxError(
                'The grid option "rowDataChangeDetectionStrategy" is deprecated. Please refer to the migration guide for more details: https://ag-grid.com/javascript-data-grid/upgrade-to-ag-grid-31/',
              ),
            ],
          });
        }
        {
          const actual = transformFile(input, [renameGridOptions], {
            sourceFilename: inputPath,
            sourceType: 'module',
            applyDangerousEdits: true,
          });
          expect(actual).toEqual({
            source: expected,
            errors: [
              new SyntaxError(
                'Vue components are not yet fully supported via codemods and may require manual fixes',
              ),
            ],
          });
        }
      });
    });
  });
});
