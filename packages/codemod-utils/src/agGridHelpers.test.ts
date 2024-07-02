import {
  ast,
  generate,
  getModuleRoot,
  matchNode,
  pattern as p,
  AccessorKey,
  type AccessorPath,
  type AstTransformContext,
  type FsContext,
  type NodePath,
  type Types,
} from '@ag-grid-devtools/ast';
import { createMockFsHelpers, memfs, vol } from '@ag-grid-devtools/test-utils';
import { unreachable } from '@ag-grid-devtools/utils';
import { describe, expect, test, beforeEach, afterEach } from 'vitest';

import {
  AG_GRID_JS_PACKAGE_NAME_PATTERN,
  AngularGridApiBinding,
  GridApiDefinition,
  getGridApiReferences,
} from './agGridHelpers';
import { getAngularTemplateRootElements } from './angularHelpers';
import { AST, VueTemplateNode } from './vueHelpers';

type Class = Types.Class;
type ClassMethod = Types.ClassMethod;
type Expression = Types.Expression;
type ExpressionStatement = Types.ExpressionStatement;
type ObjectExpression = Types.ObjectExpression;
type ObjectMethod = Types.ObjectMethod;
type ObjectProperty = Types.ObjectProperty;
type PrivateName = Types.PrivateName;
type Method = Types.ObjectMethod | Types.ClassMethod | Types.Function;

type VDirective = AST.VDirective;
type VElement = AST.VElement;

describe('AG_GRID_PACKAGE_NAME_PATTERN', () => {
  test('matches valid package names', () => {
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('ag-grid-community')).toBe(true);
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('ag-grid-enterprise')).toBe(true);
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('@ag-grid-community/core')).toBe(true);
  });

  test('does not match invalid package names', () => {
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('foo')).toBe(false);
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('@ag-grid-enterprise/core')).toBe(false);
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('ag-grid-community-foo')).toBe(false);
    expect(AG_GRID_JS_PACKAGE_NAME_PATTERN.test('@ag-grid-community/styles')).toBe(false);
  });
});

describe(getGridApiReferences, () => {
  describe('locate plain JS API instances', () => {
    test('anonymous grid instance', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        createGrid(document.body, {});
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test('const initializer', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        const gridApi = createGrid(document.body, {});
        gridApi;
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test('let initializer', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        let gridApi = createGrid(document.body, {});
        gridApi;
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test('let initializer (reassigned)', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        let gridApi;
        gridApi = createGrid(document.body, {});
        gridApi;
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test('var initializer', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        var gridApi = createGrid(document.body, {});
        gridApi;
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test('var initializer (reassigned)', () => {
      const input = ast.module`
        import { createGrid } from '@ag-grid-community/core';
        var gridApi;
        gridApi = createGrid(document.body, {});
        gridApi;
      `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    describe('CommonJS imports', () => {
      test('Direct import accessor', () => {
        const input = ast.module`
        require('@ag-grid-community/core').createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = [`require('@ag-grid-community/core').createGrid(document.body, {})`];
        expect(actual).toEqual(expected);
      });

      test('Namespaced import accessor', () => {
        const input = ast.module`
        const AgGrid = require('@ag-grid-community/core');
        AgGrid.createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['AgGrid.createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Aliased direct property accessor', () => {
        const input = ast.module`
        const createGrid = require('@ag-grid-community/core').createGrid;
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured const import', () => {
        const input = ast.module`
        const { createGrid } = require('@ag-grid-community/core');
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured const import (aliased)', () => {
        const input = ast.module`
        const { createGrid: createAgGrid } = require('@ag-grid-community/core');
        createAgGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createAgGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured let import', () => {
        const input = ast.module`
        let { createGrid } = require('@ag-grid-community/core');
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured let import (aliased)', () => {
        const input = ast.module`
        let { createGrid: createAgGrid } = require('@ag-grid-community/core');
        createAgGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createAgGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured var import', () => {
        const input = ast.module`
        var { createGrid } = require('@ag-grid-community/core');
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured var import (aliased)', () => {
        const input = ast.module`
        var { createGrid: createAgGrid } = require('@ag-grid-community/core');
        createAgGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createAgGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });
    });

    describe('UMD Globals', () => {
      test('Direct import accessor', () => {
        const input = ast.module`
        agGrid.createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = [`agGrid.createGrid(document.body, {})`];
        expect(actual).toEqual(expected);
      });

      test('Aliased direct property accessor', () => {
        const input = ast.module`
        const createGrid = agGrid.createGrid;
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured const import', () => {
        const input = ast.module`
        const { createGrid } = agGrid;
        createGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });

      test('Destructured const import (aliased)', () => {
        const input = ast.module`
        const { createGrid: createAgGrid } = agGrid;
        createAgGrid(document.body, {});
      `;
        const program = getModuleRoot(input);
        const statements = program.get('body');
        const finalStatement = statements[statements.length - 1];
        const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
          );
        const expected = ['createAgGrid(document.body, {})'];
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('locate React API instances', () => {
    test('Simple `ref.current.api` property accessor', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            gridRef.current.api.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { gridApi },
      } = matchNode(({ gridApi }) => ast.expression`${gridApi}.resetColumnState()`, {
        gridApi: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        gridApi,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });

    test('Aliased `ref.current.api` property accessor', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            const gridApi = gridRef.current.api;
            gridApi.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { api: reference },
      } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
        api: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });

    test('Aliased `ref.current` and `.api` property accessors', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            const gridElement = gridRef.current;
            const gridApi = gridElement.api;
            gridApi.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { api: reference },
      } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
        api: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });

    test('Destructured `ref.current` property accessor with aliased `.api` property accessor', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            const { current: gridElement } = gridRef;
            gridElement.api.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { api: reference },
      } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
        api: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });

    test('Destructured `ref.current` property accessor with destructured `.api` property accessor', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            const { current: gridElement } = gridRef;
            const { api: gridApi } = gridElement;
            gridApi.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { api: reference },
      } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
        api: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });

    test('Deeply destructured `ref.current` property accessor', () => {
      const input = ast.module`
        import { AgGridReact } from '@ag-grid-community/react';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            const { current: { api: gridApi } } = gridRef;
            gridApi.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { api: reference },
      } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
        api: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.jsx', { fs: memfs }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('locate Angular API instances', () => {
    describe('element bindings', () => {
      describe('inline component template', () => {
        test('type-based element binding', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { AgGridAngular } from '@ag-grid-community/angular';
            import { HttpClient } from '@angular/common/http';
            import { Component, ViewChild } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              @ViewChild(AgGridAngular) private grid!: AgGridAngular;
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              resetState() {
                this.grid.api.resetColumnState();
              }

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'element',
                accessor: 'this.grid.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test('id-based element binding', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { AgGridAngular } from '@ag-grid-community/angular';
            import { HttpClient } from '@angular/common/http';
            import { Component, ViewChild } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    #my_grid
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              @ViewChild('my_grid') private grid!: AgGridAngular;
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              resetState() {
                this.grid.api.resetColumnState();
              }

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'element',
                accessor: 'this.grid.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });
      });

      describe('external template URL', () => {
        beforeEach(() => {
          vol.fromJSON({
            './app.component.html': `
              <div>
                <ag-grid-angular
                  #my_grid
                  [columnDefs]="columnDefs"
                  [rowData]="rowData"
                  (gridReady)="onGridReady($event)"
                ></ag-grid-angular>
              </div>
            `,
          });
        });

        afterEach(() => {
          vol.reset();
        });

        test('id-based element binding', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { AgGridAngular } from '@ag-grid-community/angular';
            import { HttpClient } from '@angular/common/http';
            import { Component, ViewChild } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              templateUrl: './app.component.html',
            })
            export class AppComponent {
              @ViewChild('my_grid') private grid!: AgGridAngular;
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              resetState() {
                this.grid.api.resetColumnState();
              }

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'element',
                accessor: 'this.grid.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });
      });
    });

    describe('event handler bindings', () => {
      describe('local event properties', () => {
        test('direct event property references', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    params.api.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test.skip('destructured event argument', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady({ api }: GridReadyEvent<IOlympicData>) {
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    api.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test.skip('aliased destructured event argument', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady({ api }: GridReadyEvent<IOlympicData>) {
                const gridApi = api;
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    gridApi.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test('destructured property reference', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                const { api } = params;
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    api.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test('local property alias', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                const gridApi = params.api;
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    gridApi.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });

        test('local alias to destructured property', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                const { api: gridApi } = params;
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                    gridApi.resetColumnState();
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });
      });

      describe('class instance fields', () => {
        test('aliased event handler field', () => {
          const input = ast.module`
            import { ColDef, ColGroupDef, GridApi, GridReadyEvent } from '@ag-grid-community/core';
            import { HttpClient } from '@angular/common/http';
            import { Component } from '@angular/core';
            import { IOlympicData } from './interfaces';

            @Component({
              selector: 'my-app',
              template: \`
                <div>
                  <ag-grid-angular
                    [columnDefs]="columnDefs"
                    [rowData]="rowData"
                    (gridReady)="onGridReady($event)"
                  ></ag-grid-angular>
                </div>
              \`,
            })
            export class AppComponent {
              private gridApi!: GridApi<IOlympicData>;
              public columnDefs: (ColDef | ColGroupDef)[] = [];
              public rowData!: IOlympicData[];

              constructor(private http: HttpClient) {}

              resetState() {
                this.gridApi.resetColumnState();
              }

              onGridReady(params: GridReadyEvent<IOlympicData>) {
                this.gridApi = params.api;
                this.http
                  .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .subscribe((data) => {
                    this.rowData = data;
                  });
              }
            }
          `;
          const program = getModuleRoot(input);
          const {
            refs: { api: reference },
          } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
            api: p.expression(),
          }).find(program)!;
          const gridApis = getGridApiReferences(
            reference,
            createTransformContext('./app.component.ts', { fs: memfs }),
          );
          const actual =
            gridApis &&
            gridApis.map((gridApi) =>
              GridApiDefinition.Angular.is(gridApi)
                ? {
                    component: formatAngularComponentName(gridApi.component),
                    templateRoots: getAngularTemplateRootElements(gridApi.template.node).map(
                      (element) => element.name,
                    ),
                    element: gridApi.element.node.name,
                    binding: formatAngularGridBinding(gridApi.binding),
                  }
                : null,
            );
          const expected = [
            {
              component: 'AppComponent',
              templateRoots: ['div'],
              element: 'ag-grid-angular',
              binding: {
                type: 'event',
                output: 'gridReady',
                handler: 'onGridReady',
                eventAccessor: 'params.api',
              },
            },
          ];
          expect(actual).toEqual(expected);
        });
      });
    });
  });

  describe('locate Vue API instances', () => {
    describe('plain JS components', () => {
      test('local grid API references', () => {
        const input = ast.module`
          import { AgGridVue } from '@ag-grid-community/vue';

          const AppComponent = {
            template: \`
              <div>
                <ag-grid-vue
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  @grid-ready="onGridReady"
                ></ag-grid-vue>
              </div>
            \`,
            components: {
              'ag-grid-vue': AgGridVue,
            },
            data() {
              return {
                columnDefs: [],
                rowData: null,
              };
            },
            methods: {
              onGridReady(params) {
                fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .then((resp) => resp.json())
                  .then((data) => {
                    this.rowData = data;
                    params.api.resetColumnState();
                  });
              },
            },
          };
        `;
        const program = getModuleRoot(input);
        const {
          refs: { api: reference },
        } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
          api: p.expression(),
        }).find(program)!;
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Vue.is(gridApi)
              ? {
                  component: formatVueComponentName(gridApi.component),
                  templateRoots: formatVueComponentTemplateRoots(gridApi.template),
                  element: gridApi.element.node.name,
                  directive: formatVueEventHandlerDirectiveName(gridApi.directive),
                  handler: formatMethodName(gridApi.handler),
                  eventAccessor: formatAccessorPath(gridApi.eventAccessor),
                }
              : null,
          );
        const expected = [
          {
            component: 'AppComponent',
            templateRoots: ['div'],
            element: 'ag-grid-vue',
            directive: '@grid-ready',
            handler: 'onGridReady',
            eventAccessor: 'params.api',
          },
        ];
        expect(actual).toEqual(expected);
      });

      test.skip('destructured grid event argument', () => {
        const input = ast.module`
          import { AgGridVue } from '@ag-grid-community/vue';

          const AppComponent = {
            template: \`
              <div>
                <ag-grid-vue
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  @grid-ready="onGridReady"
                ></ag-grid-vue>
              </div>
            \`,
            components: {
              'ag-grid-vue': AgGridVue,
            },
            data() {
              return {
                columnDefs: [],
                rowData: null,
              };
            },
            methods: {
              onGridReady({ api }) {
                fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .then((resp) => resp.json())
                  .then((data) => {
                    this.rowData = data;
                    api.resetColumnState();
                  });
              },
            },
          };
        `;
        const program = getModuleRoot(input);
        const {
          refs: { api: reference },
        } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
          api: p.expression(),
        }).find(program)!;
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Vue.is(gridApi)
              ? {
                  component: formatVueComponentName(gridApi.component),
                  templateRoots: formatVueComponentTemplateRoots(gridApi.template),
                  element: gridApi.element.node.name,
                  directive: formatVueEventHandlerDirectiveName(gridApi.directive),
                  handler: formatMethodName(gridApi.handler),
                  eventAccessor: formatAccessorPath(gridApi.eventAccessor),
                }
              : null,
          );
        const expected = [
          {
            component: 'AppComponent',
            templateRoots: ['div'],
            element: 'ag-grid-vue',
            directive: '@grid-ready',
            handler: 'onGridReady',
            eventAccessor: 'params.api',
          },
        ];
        expect(actual).toEqual(expected);
      });

      test.skip('aliased destructured grid event argument', () => {
        const input = ast.module`
          import { AgGridVue } from '@ag-grid-community/vue';

          const AppComponent = {
            template: \`
              <div>
                <ag-grid-vue
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  @grid-ready="onGridReady"
                ></ag-grid-vue>
              </div>
            \`,
            components: {
              'ag-grid-vue': AgGridVue,
            },
            data() {
              return {
                columnDefs: [],
                rowData: null,
              };
            },
            methods: {
              onGridReady({ api: gridApi }) {
                fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .then((resp) => resp.json())
                  .then((data) => {
                    this.rowData = data;
                    gridApi.resetColumnState();
                  });
              },
            },
          };
        `;
        const program = getModuleRoot(input);
        const {
          refs: { api: reference },
        } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
          api: p.expression(),
        }).find(program)!;
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Vue.is(gridApi)
              ? {
                  component: formatVueComponentName(gridApi.component),
                  templateRoots: formatVueComponentTemplateRoots(gridApi.template),
                  element: gridApi.element.node.name,
                  directive: formatVueEventHandlerDirectiveName(gridApi.directive),
                  handler: formatMethodName(gridApi.handler),
                  eventAccessor: formatAccessorPath(gridApi.eventAccessor),
                }
              : null,
          );
        const expected = [
          {
            component: 'AppComponent',
            templateRoots: ['div'],
            element: 'ag-grid-vue',
            directive: '@grid-ready',
            handler: 'onGridReady',
            eventAccessor: 'params.api',
          },
        ];
        expect(actual).toEqual(expected);
      });

      test('component data field grid API references', () => {
        const input = ast.module`
          import { AgGridVue } from '@ag-grid-community/vue';

          const AppComponent = {
            template: \`
              <div>
                <button v-on:click="onBtReset()">Reset column state</button>
                <ag-grid-vue
                  :columnDefs="columnDefs"
                  :rowData="rowData"
                  @grid-ready="onGridReady"
                ></ag-grid-vue>
              </div>
            \`,
            components: {
              'ag-grid-vue': AgGridVue,
            },
            data() {
              return {
                columnDefs: [],
                gridApi: null,
                rowData: null,
              };
            },
            methods: {
              onBtReset() {
                this.gridApi.resetColumnState();
              },
              onGridReady(params) {
                this.gridApi = params.api;

                fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
                  .then((resp) => resp.json())
                  .then((data) => {
                    this.rowData = data;
                    this.onBtReset();
                  });
              },
            },
          };
        `;
        const program = getModuleRoot(input);
        const {
          refs: { api: reference },
        } = matchNode(({ api }) => ast.expression`${api}.resetColumnState()`, {
          api: p.expression(),
        }).find(program)!;
        const gridApis = getGridApiReferences(
          reference,
          createTransformContext('./app.js', { fs: memfs }),
        );
        const actual =
          gridApis &&
          gridApis.map((gridApi) =>
            GridApiDefinition.Vue.is(gridApi)
              ? {
                  component: formatVueComponentName(gridApi.component),
                  templateRoots: formatVueComponentTemplateRoots(gridApi.template),
                  element: gridApi.element.node.name,
                  directive: formatVueEventHandlerDirectiveName(gridApi.directive),
                  handler: formatMethodName(gridApi.handler),
                  eventAccessor: formatAccessorPath(gridApi.eventAccessor),
                }
              : null,
          );
        const expected = [
          {
            component: 'AppComponent',
            templateRoots: ['div'],
            element: 'ag-grid-vue',
            directive: '@grid-ready',
            handler: 'onGridReady',
            eventAccessor: 'params.api',
          },
        ];
        expect(actual).toEqual(expected);
      });
    });
  });

  describe('allowedImports', () => {
    test('should allow imports in context allowedImports, vanilla js', () => {
      const input = ast.module`
      import { createGrid } from 'my-custom-import/hello';
      createGrid(document.body, {});
    `;
      const program = getModuleRoot(input);
      const statements = program.get('body');
      const finalStatement = statements[statements.length - 1];
      const reference = (finalStatement as NodePath<ExpressionStatement>).get('expression');
      const gridApis = getGridApiReferences(
        reference,
        createTransformContext('./app.js', {
          fs: memfs,
          allowedImports: ['my-custom-import/hello'],
        }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.Js.is(gridApi) ? generate(gridApi.initializer.node) : null,
        );
      const expected = ['createGrid(document.body, {})'];
      expect(actual).toEqual(expected);
    });

    test.only('should allow imports in context allowedImports, react', () => {
      const input = ast.module`
        import { AgGridReact } from 'my-custom-import/hello';
        import { useRef } from 'react';

        function MyComponent(props) {
          const gridRef = useRef(null);
          const resetState = useCallback(() => {
            gridRef.current.api.resetColumnState();
          }, []);
          return (
            <>
              <AgGridReact ref={gridRef} />
              <button onClick={resetState}>Reset State</button>
            </>
          );
        }
      `;
      const program = getModuleRoot(input);
      const {
        refs: { gridApi },
      } = matchNode(({ gridApi }) => ast.expression`${gridApi}.resetColumnState()`, {
        gridApi: p.expression(),
      }).find(program)!;
      const gridApis = getGridApiReferences(
        gridApi,
        createTransformContext('./app.jsx', {
          fs: memfs,
          allowedImports: ['my-custom-import/hello'],
        }),
      );
      const actual =
        gridApis &&
        gridApis.map((gridApi) =>
          GridApiDefinition.React.is(gridApi)
            ? {
                element: generate(gridApi.element.node),
                refAccessor: formatAccessorPath(gridApi.refAccessor),
              }
            : null,
        );
      const expected = [
        {
          element: '<AgGridReact ref={gridRef} />',
          refAccessor: 'useRef(null).current.api',
        },
      ];
      expect(actual).toEqual(expected);
    });
  });
});

function formatAccessorPath(accessor: AccessorPath): string {
  const {
    root: { target },
    path,
  } = accessor;
  return [generate(target.node), ...path.map(({ key }) => formatValueAccessorKey(key))].join('');
}

function formatValueAccessorKey(key: AccessorKey): string {
  if (AccessorKey.Property.is(key)) return `.${key.name}`;
  if (AccessorKey.PrivateField.is(key)) return `.#${key.name}`;
  if (AccessorKey.Index.is(key)) return `[${key.index}]`;
  if (AccessorKey.ObjectRest.is(key)) return `[...]`;
  if (AccessorKey.ArrayRest.is(key)) return `[...]`;
  if (AccessorKey.Computed.is(key)) return `[${generate(key.expression.node)}]`;
  return unreachable(key);
}

function formatAngularComponentName(component: NodePath<Class>): string | null {
  if (!component.node.id) return null;
  return component.node.id.name;
}

function formatAngularComponentMethodName(method: NodePath<ClassMethod>): string | null {
  const key = generate(method.get('key').node);
  const computed = method.node.computed;
  return computed ? `[${key}]` : key;
}

function formatAngularGridBinding(binding: AngularGridApiBinding): Record<string, any> {
  if (AngularGridApiBinding.Event.is(binding)) {
    return {
      type: 'event',
      output: binding.output.node.name,
      handler: formatAngularComponentMethodName(binding.handler),
      eventAccessor: formatAccessorPath(binding.eventAccessor),
    };
  } else {
    return {
      type: 'element',
      accessor: formatAccessorPath(binding.accessor),
    };
  }
}

function formatVueComponentName(component: NodePath<ObjectExpression>): string | null {
  if (!component.parentPath.isVariableDeclarator()) return null;
  const key = component.parentPath.get('id');
  if (!key.isIdentifier()) return null;
  return key.node.name;
}

function formatVueComponentTemplateRoots(element: VElement): Array<string | null> | null {
  if (element.name !== 'template') return null;
  return element.children
    .filter((child, index, array) => {
      const isFirstChild = index === 0;
      const isLastChild = index === array.length - 1;
      if ((isFirstChild || isLastChild) && child.type === 'VText' && child.value.trim() === '') {
        return false;
      }
      return true;
    })
    .map((child) => (child.type === 'VElement' ? child.name : null));
}

function formatVueEventHandlerDirectiveName(attribute: VueTemplateNode<VDirective>): string | null {
  const { key } = attribute.node;
  if (key.name.name !== 'on') return null;
  if (!key.argument || key.argument.type !== 'VIdentifier') return null;
  return `@${key.argument.name}`;
}

function formatMethodName(method: NodePath<Method>): string | null {
  if (method.isClassMethod()) return formatClassMethodName(method);
  if (method.isObjectMethod()) return formatObjectMethodName(method);
  if (method.parentPath.isObjectProperty()) return formatObjectPropertyName(method.parentPath);
  return null;
}

function formatClassMethodName(method: NodePath<ClassMethod>): string | null {
  const key = method.get('key');
  const computed = method.node.computed;
  return formatPropertyAccessorKey(key, computed);
}

function formatObjectMethodName(method: NodePath<ObjectMethod>): string | null {
  const key = method.get('key');
  const computed = method.node.computed;
  return formatPropertyAccessorKey(key, computed);
}

function formatObjectPropertyName(property: NodePath<ObjectProperty>): string | null {
  const key = property.get('key');
  const computed = property.node.computed;
  return formatPropertyAccessorKey(key, computed);
}

function formatPropertyAccessorKey(
  key: NodePath<Expression | PrivateName>,
  computed: boolean,
): string {
  if (computed) return `[${generate(key.node)}]`;
  return generate(key.node);
}

function createTransformContext(
  filename: string,
  options: {
    fs: typeof memfs;
    allowedImports?: string[];
  },
): AstTransformContext<FsContext> {
  const { fs, allowedImports } = options;
  return {
    filename,
    opts: {
      fs: createMockFsHelpers(fs),
      allowedImports,
    },
  };
}
