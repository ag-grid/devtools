// @ts-nocheck
import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

ModuleRegistry.registerModules([ServerSideRowModelModule, ExcelExportModule]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
