import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultExcelExportParams: {
    author: 'foo',
    fontSize: 11,
    sheetName: 'bar'
  },
});
