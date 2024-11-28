import { AG_GRID_LOCALE_DE } from '@ag-grid-community/locale';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ClientSideRowModelModule } from 'ag-grid-community';
import { AlignedGrid, AllCommunityModule, GridOptions, ModuleRegistry } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ClipboardModule } from 'ag-grid-enterprise';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { MultiFilterModule } from 'ag-grid-enterprise';
import { RangeSelectionModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';
import { SideBarModule } from 'ag-grid-enterprise';
import { StatusBarModule } from 'ag-grid-enterprise';
import { IOlympicData } from './interfaces';

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClientSideRowModelModule,
  ClipboardModule,
  ColumnsToolPanelModule,
  CsvExportModule,
  ExcelExportModule,
  FiltersToolPanelModule,
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
