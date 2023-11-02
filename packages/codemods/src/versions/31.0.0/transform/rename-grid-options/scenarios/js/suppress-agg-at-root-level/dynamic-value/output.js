/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const suppressAggAtRootLevel = true;

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  alwaysAggregateAtRootLevel: !suppressAggAtRootLevel,
});
