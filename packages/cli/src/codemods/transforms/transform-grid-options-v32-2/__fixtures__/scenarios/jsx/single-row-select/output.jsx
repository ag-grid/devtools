import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {
  const onRangeSelectionChanged = useCallback(() => {}, []);

  const selection = useMemo(() => ({
    mode: 'singleRow',
    suppressClickSelection: true,
  }), []);

  return (
    (<AgGridReact 
      columnDefs={[]} 
      rowData={[]} 
      selection={selection}
      onCellSelectionChanged={onRangeSelectionChanged}
    />)
  );
}
