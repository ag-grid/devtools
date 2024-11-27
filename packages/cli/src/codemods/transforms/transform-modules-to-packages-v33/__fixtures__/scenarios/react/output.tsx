'use client';

import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

function MyComponent(props) {
  console.log("Hello, world!");
  return (
    <div>
      <AgGridReact columnDefs={[] as ColDef[]} rowData={[]} />
    </div>
  );
}
