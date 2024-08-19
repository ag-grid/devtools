import { createGrid } from '@ag-grid-community/core';

const serverSideFilterAllLevels = true;

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
  serverSideOnlyRefreshFilteredGroups: !serverSideFilterAllLevels,
});
