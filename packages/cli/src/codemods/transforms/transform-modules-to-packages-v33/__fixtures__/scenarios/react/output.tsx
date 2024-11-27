'use client';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

function MyComponent(props) {
  console.log("Hello, world!");
  return (
    <div>
      <AgGridReact columnDefs={[] as ColDef[]} rowData={[]} />
    </div>
  );
}
