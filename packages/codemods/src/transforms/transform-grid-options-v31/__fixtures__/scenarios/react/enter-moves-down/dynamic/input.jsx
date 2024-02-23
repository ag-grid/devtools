import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enterMovesDown={{ foo: true }.foo}
        enterMovesDownAfterEdit={{ foo: true }.foo}
      />
    </div>
  );
}
