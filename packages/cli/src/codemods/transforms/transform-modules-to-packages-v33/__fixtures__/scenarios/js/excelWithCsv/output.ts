// @ts-nocheck
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { CsvExportModule, GridOptions, ModuleRegistry } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  AllCommunityModule,
  ExcelExportModule,
  CsvExportModule
]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
