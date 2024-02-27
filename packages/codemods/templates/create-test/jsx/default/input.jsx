import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  console.log("Hello, world!");
  return (
    <div>
      <AgGridReact columnDefs={[]} rowData={[]} />
    </div>
  );
}
