import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        advancedFilterModel={{
          filterType: 'join',
          type: 'AND',
          conditions: [],
        }}
      />
    </div>
  );
}
