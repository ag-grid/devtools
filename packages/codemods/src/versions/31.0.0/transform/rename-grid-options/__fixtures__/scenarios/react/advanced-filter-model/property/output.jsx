/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const advancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [],
  };
  return (
    (<div>
      <AgGridReact columnDefs={[]} rowData={[]} initialState={{
        filter: {
          advancedFilterModel: advancedFilterModel
        }
      }} />
    </div>)
  );
}
