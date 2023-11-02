/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const serverSideStoreType = 'partial';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  serverSideStoreType,
});
