/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  enterNavigatesVertically: true,
  enterNavigatesVerticallyAfterEdit: true,
});
