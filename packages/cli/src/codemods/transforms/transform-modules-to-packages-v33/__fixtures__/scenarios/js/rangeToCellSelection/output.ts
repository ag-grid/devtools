// @ts-nocheck
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ServerSideRowModelModule } from 'ag-grid-enterprise';

import { GridOptions, ModuleRegistry } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ServerSideRowModelModule, AllCommunityModule, CellSelectionModule]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
