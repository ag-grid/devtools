import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const enterMovesDown = true;
  const enterMovesDownAfterEdit = true;
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enterMovesDown={enterMovesDown}
        enterMovesDownAfterEdit={enterMovesDownAfterEdit}
      />
    </div>
  );
}
