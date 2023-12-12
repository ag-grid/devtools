import { type CodemodFsUtils } from '@ag-grid-devtools/types';
import { fs as memfs } from 'memfs';
import { describe, expect, test } from 'vitest';

import codemod from './codemod';

describe('Retains line endings', () => {
  describe('CRLF', () => {
    describe('JavaScript source files', () => {
      test('No modifications', () => {
        const input = [
          `import { Foo } from 'unrelated-package';`,
          `new Foo(document.body, { bar: true });`,
        ].join('\r\n');
        const actual = codemod(
          { path: './input.js', source: input },
          {
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({ source: null, errors: [] });
      });

      test('Modifications', () => {
        const input = [
          `import { Grid } from 'ag-grid-community';`,
          `const options = { foo: true };`,
          `new Grid(document.body, options);`,
        ].join('\r\n');
        const expected = [
          `import { createGrid } from 'ag-grid-community';`,
          `const options = { foo: true };`,
          `const optionsApi = createGrid(document.body, options);`,
        ].join('\r\n');
        const actual = codemod(
          { path: './input.js', source: input },
          {
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({ source: expected, errors: [] });
      });
    });

    describe('Vue source files', () => {
      test('No modifications', () => {
        const input = [
          `<script>`,
          `export default {`,
          `  data() {`,
          `    return {`,
          `      greeting: 'Hello World!'`,
          `    }`,
          `  }`,
          `}`,
          `</script>`,
          ``,
          `<template>`,
          `  <p class="greeting">{{ greeting }}</p>`,
          `<template>`,
          ``,
          `<style>`,
          `.greeting {`,
          `  color: red;`,
          `  font-weight: bold;`,
          `}`,
          `</style>`,
        ].join('\r\n');
        const actual = codemod(
          { path: './input.vue', source: input },
          {
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          },
        );
        expect(actual).toEqual({ source: null, errors: [] });
      });

      test('Modifications', () => {
        const input = [
          `<script>`,
          `import { AgGridVue } from '@ag-grid-community/vue';`,
          ``,
          `export default {`,
          `  components: {`,
          `    'ag-grid-vue': AgGridVue,`,
          `  },`,
          `  data() {`,
          `    return {`,
          `      columnDefs: [],`,
          `      rowData: [],`,
          `      advancedFilterModel: {`,
          `        filterType: 'join',`,
          `        type: 'AND',`,
          `        conditions: [],`,
          `      },`,
          `    };`,
          `  },`,
          `};`,
          `</script>`,
          ``,
          `<template>`,
          `  <div>`,
          `    <ag-grid-vue`,
          `      :columnDefs="columnDefs"`,
          `      :rowData="rowData"`,
          `      :advancedFilterModel="advancedFilterModel"`,
          `    ></ag-grid-vue>`,
          `  </div>`,
          `</template>`,
        ].join('\r\n');
        const expected = [
          `<script>`,
          `import { AgGridVue } from '@ag-grid-community/vue';`,
          ``,
          `export default {`,
          `  components: {`,
          `    'ag-grid-vue': AgGridVue,`,
          `  },`,
          `  data() {`,
          `    return {`,
          `      columnDefs: [],`,
          `      rowData: [],`,
          `      advancedFilterModel: {`,
          `        filter: {`,
          `          advancedFilterModel: {`,
          `            filterType: 'join',`,
          `            type: 'AND',`,
          `            conditions: []`,
          `          }`,
          `        }`,
          `      },`,
          `    };`,
          `  },`,
          `};`,
          `</script>`,
          ``,
          `<template>`,
          `  <div>`,
          `    <ag-grid-vue`,
          `      :columnDefs="columnDefs"`,
          `      :rowData="rowData"`,
          `      :initialState="advancedFilterModel"`,
          `    ></ag-grid-vue>`,
          `  </div>`,
          `</template>`,
        ].join('\r\n');
        const actual = codemod(
          { path: './input.vue', source: input },
          {
            applyDangerousEdits: true,
            fs: createFsHelpers(memfs),
          },
        );
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
