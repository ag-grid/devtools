/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    (<div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        initialState={{
          filter: {
            advancedFilterModel: {
              filterType: 'join',
              type: 'AND',
              conditions: []
            }
          }
        }}
      />
    </div>)
  );
}
