import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { createGrid } from 'ag-grid-community';
import {
  AllEnterpriseModule,
  LicenseManager,
  ModuleRegistry,
  provideGlobalGridOptions,
} from 'ag-grid-enterprise';

import { AgChartsCommunityModule } from 'ag-charts-community';
ModuleRegistry.registerModules([AllEnterpriseModule.with(AgChartsCommunityModule)]);

provideGlobalGridOptions({
  theme: 'legacy'
});

LicenseManager.setLicenseKey('your License Key');

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
