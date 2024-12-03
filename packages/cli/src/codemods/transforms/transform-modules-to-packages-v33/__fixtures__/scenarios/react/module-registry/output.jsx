import { useState } from 'react';

import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { StatusBarModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule, StatusBarModule]);

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { LicenseManager } from 'ag-grid-enterprise';
LicenseManager.setLicenseKey('<your license key>');

function App() {
  return <div></div>;
}

export default App;
