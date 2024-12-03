// @ts-nocheck
import { AG_GRID_LOCALE_DE } from '@ag-grid-community/locale';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { AlignedGrid, GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ClipboardModule } from '@ag-grid-enterprise/clipboard';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { MultiFilterModule } from '@ag-grid-enterprise/multi-filter';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { SideBarModule } from '@ag-grid-enterprise/side-bar';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';
import { IOlympicData } from './interfaces';

ModuleRegistry.registerModules([
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
  StatusBarModule,
]);

const gridOptions: GridOptions<IOlympicData> = {
  localeText: AG_GRID_LOCALE_DE,
  rowSelection: { mode: 'multiRow' },
};
