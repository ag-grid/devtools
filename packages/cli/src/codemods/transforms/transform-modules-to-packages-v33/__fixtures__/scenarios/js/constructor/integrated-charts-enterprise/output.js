import { ClientSideRowModelModule } from 'ag-grid-community';
import { AllCommunityModule, createGrid } from 'ag-grid-community';
import { IntegratedChartsModule } from 'ag-grid-enterprise';
import { SparklinesModule } from 'ag-grid-enterprise';

import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const gridOptions = {};

const api = createGrid(document.body, gridOptions, {
  modules: [
    AllCommunityModule,
    ClientSideRowModelModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule)
  ],
});

const sharedModules = [ClientSideRowModelModule, IntegratedChartsModule.with(AgChartsEnterpriseModule), SparklinesModule.with(AgChartsEnterpriseModule)];

const api1 = createGrid(document.body, gridOptions, {
  modules: sharedModules,
});

const api2 = createGrid(document.body, gridOptions, {
  modules: sharedModules,
});
