import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule, StatusBarModule]);

import './style.css';

import { LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey('<your license key>');

class SimpleGrid {
  gridOptions = {};

  constructor() {
    this.gridOptions = {
      columnDefs: [{ field: 'make' }, { field: 'model' }, { field: 'price' }],
      rowData: [
        { make: 'Toyota', model: 'Celica', price: 35000 },
        { make: 'Ford', model: 'Mondeo', price: 32000 },
        { make: 'Porsche', model: 'Boxster', price: 72000 },
      ],
      defaultColDef: {
        flex: 1,
      },
      statusBar: {
        statusPanels: [
          {
            statusPanel: 'agTotalAndFilteredRowCountComponent',
            align: 'left',
          },
        ],
      },
    };

    const eGridDiv = document.querySelector('#app');
    createGrid(eGridDiv, this.gridOptions);
  }
}

new SimpleGrid();