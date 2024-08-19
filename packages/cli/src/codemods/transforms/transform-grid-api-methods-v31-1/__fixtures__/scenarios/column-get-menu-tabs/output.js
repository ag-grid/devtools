import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});

const [firstColumn, secondColumn] = gridApi.getColumns();
firstColumn.getColDef().menuTabs || ['filterMenuTab' | 'generalMenuTab'];
secondColumn.getColDef().menuTabs || ['columnsMenuTab'];
