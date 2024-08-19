import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enterMovesDown={null}
        enterMovesDownAfterEdit={null}
      />
    </div>
  );
}
