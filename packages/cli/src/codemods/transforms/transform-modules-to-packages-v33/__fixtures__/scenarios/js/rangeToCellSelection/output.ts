import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { ServerSideRowModelModule } from 'ag-grid-enterprise';

import { AllCommunityModule, GridOptions, ModuleRegistry } from 'ag-grid-community';
import { CellSelectionModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, ServerSideRowModelModule, CellSelectionModule]);

const gridOptions: GridOptions = {
  rowSelection: { mode: 'multiRow' },
};
