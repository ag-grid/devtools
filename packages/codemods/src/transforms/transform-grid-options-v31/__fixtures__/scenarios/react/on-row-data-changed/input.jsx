import { AgGridReact } from '@ag-grid-community/react';
import { useCallback } from 'react';

function MyComponent(props) {
  const onRowDataChanged = useCallback((params) => {
    console.log('onRowDataChanged', params);
  }, []);
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        onRowDataChanged={onRowDataChanged}
      />
    </div>
  );
}
