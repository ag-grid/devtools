// @ts-nocheck
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { type GridApi, ModuleRegistry, type GridOptions, createGrid } from 'ag-grid-community';

import type { IOlympicData } from './interfaces';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [] as IOlympicData[],
});
