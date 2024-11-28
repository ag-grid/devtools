import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { AllCommunityModule, GridOptions, ModuleRegistry } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';
import { MultiFilterModule } from 'ag-grid-enterprise';
import { CellSelectionModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';
import { SideBarModule } from 'ag-grid-enterprise';
import { StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ServerSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  CsvExportModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  ColumnMenuModule,
  ContextMenuModule,
  MultiFilterModule,
  CellSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule
]);

const gridOptions: GridOptions<IOlympicData> = {
  rowSelection: { mode: 'multiRow' },
};
