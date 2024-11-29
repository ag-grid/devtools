import { createGrid } from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-charts-enterprise';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import 'ag-grid-charts-enterprise';

LicenseManager.setLicenseKey('your License Key');

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
