'use client';

import React, { StrictMode, useState } from 'react';

import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import type { ColDef } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
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
