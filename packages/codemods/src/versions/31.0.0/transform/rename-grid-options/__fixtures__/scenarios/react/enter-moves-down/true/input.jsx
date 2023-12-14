/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enterMovesDown={true}
        enterMovesDownAfterEdit={true}
      />
    </div>
  );
}
