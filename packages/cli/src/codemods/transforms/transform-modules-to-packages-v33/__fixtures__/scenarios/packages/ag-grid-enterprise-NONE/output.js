import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { createGrid } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager, ModuleRegistry } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllEnterpriseModule]);

LicenseManager.setLicenseKey('your License Key');

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
