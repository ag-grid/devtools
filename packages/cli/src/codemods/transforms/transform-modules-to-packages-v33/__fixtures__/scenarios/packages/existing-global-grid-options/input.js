import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { createGrid } from 'ag-grid-community';
import { LicenseManager } from 'ag-grid-enterprise';

import 'ag-grid-enterprise';

LicenseManager.setLicenseKey('your License Key');

provideGlobalGridOptions({
  theme: 'legacy'
});

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
