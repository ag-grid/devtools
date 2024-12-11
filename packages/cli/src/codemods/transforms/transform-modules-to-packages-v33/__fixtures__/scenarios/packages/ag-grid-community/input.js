import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { createGrid } from 'ag-grid-community';

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
