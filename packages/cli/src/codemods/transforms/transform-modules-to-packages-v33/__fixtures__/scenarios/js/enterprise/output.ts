// @ts-nocheck
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridOptions, ModuleRegistry } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';
import { MultiFilterModule } from 'ag-grid-enterprise';
import { CellSelectionModule } from 'ag-grid-enterprise';
import {
  GroupFilterModule,
  PivotModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  TreeDataModule,
} from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';
import { SideBarModule } from 'ag-grid-enterprise';
import { StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  AllCommunityModule,
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
  RowGroupingPanelModule,
  GroupFilterModule,
  TreeDataModule,
  PivotModule,
  SetFilterModule,
  SideBarModule,
  StatusBarModule
]);

const gridOptions: GridOptions<IOlympicData> = {
  rowSelection: { mode: 'multiRow' },
};
