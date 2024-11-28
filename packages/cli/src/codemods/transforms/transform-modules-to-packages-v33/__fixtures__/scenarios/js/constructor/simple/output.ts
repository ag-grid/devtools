import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { GridOptions, createGrid } from 'ag-grid-community';

import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';
import { MasterDetailModule } from 'ag-grid-enterprise';

const gridOptions: GridOptions = {};

const api = createGrid(document.body, gridOptions, {
  modules: [
    AllCommunityModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    MasterDetailModule
  ],
});
