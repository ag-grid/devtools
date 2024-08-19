import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  console.log("Goodbye, world!");
  return (
    <div>
      <AgGridReact columnDefs={[]} rowData={[]} />
    </div>
  );
}
