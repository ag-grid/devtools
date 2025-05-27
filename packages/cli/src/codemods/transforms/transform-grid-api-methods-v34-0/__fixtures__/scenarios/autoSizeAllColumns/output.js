import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const flag = true;

gridApi.autoSizeAllColumns();
gridApi?.autoSizeAllColumns({
  skipHeaders: true
});
gridApi?.autoSizeAllColumns({
  skipHeaders: false
});
gridApi.autoSizeAllColumns({
  skipHeaders: flag
});
