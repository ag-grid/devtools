/* eslint-disable */
import { createGrid } from '@ag-grid-community/core';

const enableChartToolPanelsButton = true;

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  suppressChartToolPanelsButton: !enableChartToolPanelsButton,
});
