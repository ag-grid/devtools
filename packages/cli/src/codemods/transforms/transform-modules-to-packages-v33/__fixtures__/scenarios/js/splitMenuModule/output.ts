import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

import { AllCommunityModule, GridOptions, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ServerSideRowModelModule,
  ColumnMenuModule,
  ContextMenuModule
]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
