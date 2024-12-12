// @ts-nocheck
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridOptions, ModuleRegistry } from 'ag-grid-community';
import {
  ColumnsToolPanelModule,
  GroupFilterModule,
  PivotModule,
  RowGroupingModule,
  RowGroupingPanelModule,
  TreeDataModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  ServerSideRowModelModule,
  AllCommunityModule,
  ColumnsToolPanelModule,
  RowGroupingPanelModule,
  RowGroupingModule,
  GroupFilterModule,
  TreeDataModule,
  PivotModule
]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
