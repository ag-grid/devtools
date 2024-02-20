/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  defaultExcelExportParams: {
    author: 'foo',
    exportMode: 'xml',
    fontSize: 11,
    suppressTextAsCDATA: true,
    sheetName: 'bar',
  },
});
