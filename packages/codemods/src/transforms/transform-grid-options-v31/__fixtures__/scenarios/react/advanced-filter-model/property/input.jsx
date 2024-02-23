import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const advancedFilterModel = {
    filterType: 'join',
    type: 'AND',
    conditions: [],
  };
  return (
    <div>
      <AgGridReact columnDefs={[]} rowData={[]} advancedFilterModel={advancedFilterModel} />
    </div>
  );
}
