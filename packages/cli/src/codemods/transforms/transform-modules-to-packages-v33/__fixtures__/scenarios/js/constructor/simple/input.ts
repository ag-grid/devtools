// @ts-nocheck
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import { GridOptions, createGrid } from '@ag-grid-community/core';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MasterDetailModule } from '@ag-grid-enterprise/master-detail';

const gridOptions: GridOptions = {};

const api = createGrid(document.body, gridOptions, {
  modules: [ClientSideRowModelModule, CsvExportModule, ExcelExportModule, MasterDetailModule],
});
