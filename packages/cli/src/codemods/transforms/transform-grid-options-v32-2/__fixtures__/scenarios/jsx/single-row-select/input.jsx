import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const onRangeSelectionChanged = useCallback(() => {}, []);
  
  return (
    <AgGridReact 
      columnDefs={[]} 
      rowData={[]} 
      suppressRowClickSelection 
      rowSelection="single" 
      onRangeSelectionChanged={onRangeSelectionChanged}
    />
  );
}
