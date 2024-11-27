import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import {
  ClipboardModule,
  ColumnsToolPanelModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MenuModule,
  MultiFilterModule,
  RangeSelectionModule,
  RowGroupingModule,
  ServerSideRowModelModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule,
} from 'ag-grid-enterprise';

import { AllCommunityModule, CsvExportModule, GridOptions, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ServerSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  CsvExportModule,
  ExcelExportModule,
  FiltersToolPanelModule,
  GridChartsModule,
  MenuModule,
  MultiFilterModule,
  RangeSelectionModule,
  RowGroupingModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule
]);

const gridOptions: GridOptions<IOlympicData> = {
  localeText: AG_GRID_LOCALE_DE,
  rowSelection: { mode: 'multiRow' },
};
