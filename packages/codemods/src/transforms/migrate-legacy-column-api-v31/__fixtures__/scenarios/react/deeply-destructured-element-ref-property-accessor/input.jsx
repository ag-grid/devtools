import { AgGridReact } from '@ag-grid-community/react';
import { useRef } from 'react';

function MyComponent(props) {
  const gridRef = useRef(null);
  const resetState = useCallback(() => {
    const {
      current: { columnApi: gridApi },
    } = gridRef;
    gridApi.resetColumnState();
  }, []);
  return (
    <>
      <AgGridReact ref={gridRef} />
      <button onClick={resetState}>Reset State</button>
    </>
  );
}
