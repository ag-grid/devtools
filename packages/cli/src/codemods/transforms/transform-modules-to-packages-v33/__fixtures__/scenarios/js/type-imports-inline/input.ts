// @ts-nocheck
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { type GridApi, ModuleRegistry, type GridOptions, createGrid } from '@ag-grid-community/core';

import type { IOlympicData } from './interfaces';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [] as IOlympicData[],
});
