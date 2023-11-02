/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const advancedFilterModel = {
    filter: {
      advancedFilterModel: {
        filterType: 'join',
        type: 'AND',
        conditions: []
      }
    }
  };
  return (
    (<div>
      <AgGridReact columnDefs={[]} rowData={[]} initialState={advancedFilterModel} />
    </div>)
  );
}
