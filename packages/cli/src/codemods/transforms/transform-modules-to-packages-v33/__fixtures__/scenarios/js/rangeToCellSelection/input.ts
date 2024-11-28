import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from '@ag-grid-enterprise/server-side-row-model';

import { GridOptions, ModuleRegistry } from '@ag-grid-community/core';
import { RangeSelectionModule } from '@ag-grid-enterprise/range-selection';

ModuleRegistry.registerModules([ServerSideRowModelModule, RangeSelectionModule]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
