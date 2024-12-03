// @ts-nocheck
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';

import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';

ModuleRegistry.registerModules([ServerSideRowModelModule, MenuModule]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
