'use client';

import React, { StrictMode, useState } from 'react';

import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import type { ColDef } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridReact } from '@ag-grid-community/react';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

function MyComponent(props) {
  console.log("Hello, world!");
  return (
    <div>
      <AgGridReact columnDefs={[] as ColDef[]} rowData={[]} />
    </div>
  );
}
