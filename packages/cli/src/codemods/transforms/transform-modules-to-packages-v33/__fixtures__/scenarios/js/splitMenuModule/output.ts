import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ServerSideRowModelModule } from 'ag-grid-enterprise';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

import { GridOptions, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  AllCommunityModule,
  ColumnMenuModule,
  ContextMenuModule
]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
