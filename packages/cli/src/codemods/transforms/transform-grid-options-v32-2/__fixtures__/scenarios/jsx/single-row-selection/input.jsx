import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  return (
    <AgGridReact 
      columnDefs={[]} 
      rowData={[]} 

      rowSelection="single" 

      onRangeSelectionChanged={() => {}}
      onRangeDeleteStart={() => {}}
      onRangeDeleteEnd={() => {}}

      suppressRowClickSelection
      suppressRowDeselection
      isRowSelectable={(params) => params.data.year < 2007}

      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges
    />
  );
}
