import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const array = ['bar'];
const flag = true;
const allArgs = [['baz'], false];

gridApi.autoSizeColumns({
  colIds: ['foo'],
  skipHeader: true
});
gridApi?.autoSizeColumns({
  colIds: ['foo'],
  skipHeader: false
});
gridApi.autoSizeColumns({
  colIds: array,
  skipHeader: flag
});
gridApi.autoSizeColumns({
  colIds: array
});
gridApi.autoSizeColumns(...allArgs);
