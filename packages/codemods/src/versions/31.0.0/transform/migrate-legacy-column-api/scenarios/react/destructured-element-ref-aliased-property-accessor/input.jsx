/* eslint-disable */
import { AgGridReact } from '@ag-grid-community/react';
import { useRef } from 'react';

function MyComponent(props) {
  const gridRef = useRef(null);
  const resetState = useCallback(() => {
    const { current: gridElement } = gridRef;
    gridElement.columnApi.resetColumnState();
  }, []);
  return (
    <>
      <AgGridReact ref={gridRef} />
      <button onClick={resetState}>Reset State</button>
    </>
  );
}
