/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const serverSideStoreType = 'full';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  serverSideStoreType,
});
