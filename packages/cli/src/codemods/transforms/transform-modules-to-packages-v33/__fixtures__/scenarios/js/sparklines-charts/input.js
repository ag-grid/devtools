import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry, createGrid } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts';
import { SparklinesModule } from '@ag-grid-enterprise/sparklines';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, SparklinesModule]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [],
});
