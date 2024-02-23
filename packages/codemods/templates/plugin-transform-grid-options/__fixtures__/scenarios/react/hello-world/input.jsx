import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        hello="world"
        goodbye="world"
        friendly
      />
    </div>
  );
}
