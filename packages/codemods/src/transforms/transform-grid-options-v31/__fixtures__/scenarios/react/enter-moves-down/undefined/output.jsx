import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  return (
    (<div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        enterNavigatesVertically={undefined}
        enterNavigatesVerticallyAfterEdit={undefined}
      />
    </div>)
  );
}
