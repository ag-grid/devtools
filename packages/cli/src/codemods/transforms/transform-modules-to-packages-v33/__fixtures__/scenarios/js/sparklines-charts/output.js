import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry, createGrid } from 'ag-grid-community';
import { IntegratedChartsModule } from 'ag-grid-enterprise';
import { SparklinesModule } from 'ag-grid-enterprise';

import { AgChartsCommunityModule } from 'ag-charts-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  IntegratedChartsModule.with(AgChartsCommunityModule),
  SparklinesModule.with(AgChartsCommunityModule)
]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
