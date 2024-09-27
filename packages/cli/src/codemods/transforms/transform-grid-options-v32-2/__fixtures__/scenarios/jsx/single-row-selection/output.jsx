import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      rowSelection={{
        mode: "singleRow",
        isRowSelectable: (params) => params.data.year < 2007
      }}
      onCellSelectionChanged={() => {}}
      onCellSelectionDeleteStart={() => {}}
      onCellSelectionDeleteEnd={() => {}}
      suppressRowClickSelection
      suppressRowDeselection
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges />)
  );
}
