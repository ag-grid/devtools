import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { IntegratedChartsModule } from 'ag-grid-enterprise';

import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule)
]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
