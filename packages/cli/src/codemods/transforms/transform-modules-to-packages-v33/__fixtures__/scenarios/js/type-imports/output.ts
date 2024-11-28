import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef, ColGroupDef, GridApi, GridOptions } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, createGrid } from 'ag-grid-community';

import type { IOlympicData } from './interfaces';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

const gridApi = createGrid(document.body, {
  columnDefs: [],
  rowData: [] as IOlympicData[],
});