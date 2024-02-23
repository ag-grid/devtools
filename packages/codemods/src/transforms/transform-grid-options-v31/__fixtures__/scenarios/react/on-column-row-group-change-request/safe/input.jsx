import { AgGridReact } from '@ag-grid-community/react';
import { useCallback } from 'react';

function MyComponent(props) {
  const onColumnRowGroupChangeRequest = useCallback((params) => {
    console.log('onColumnRowGroupChangeRequest', params);
  }, []);
  return (
    <div>
      <AgGridReact
        columnDefs={[]}
        rowData={[]}
        onColumnRowGroupChangeRequest={onColumnRowGroupChangeRequest}
      />
    </div>
  );
}
