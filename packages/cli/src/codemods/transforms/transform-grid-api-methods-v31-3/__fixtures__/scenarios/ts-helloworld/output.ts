// @ts-nocheck
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const col = 'foo';
const row = {};
gridApi.getCellValue({
  colKey: col,
  rowNode: row
});
gridApi?.getCellValue({
  colKey: 'colId',
  rowNode: row
});
gridApi!.getCellValue({
  colKey: 'x',
  rowNode: row
});