import { useState } from 'react';

import { AgGridReact } from '@ag-grid-community/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { StatusBarModule } from '@ag-grid-enterprise/status-bar';

ModuleRegistry.registerModules([ClientSideRowModelModule, StatusBarModule]);

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import { LicenseManager } from '@ag-grid-enterprise/core';
LicenseManager.setLicenseKey('<your license key>');

function App() {
  return <div></div>;
}

export default App;
