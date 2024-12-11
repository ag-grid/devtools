import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { createGrid } from '@ag-grid-community/core';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { SparklinesModule } from "@ag-grid-enterprise/sparklines";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

const gridOptions = {};

const api = createGrid(document.body, gridOptions, {
  modules: [ClientSideRowModelModule, GridChartsModule],
});

const sharedModules = [ClientSideRowModelModule, GridChartsModule, SparklinesModule];

const api1 = createGrid(document.body, gridOptions, {
  modules: sharedModules,
});

const api2 = createGrid(document.body, gridOptions, {
  modules: sharedModules,
});
