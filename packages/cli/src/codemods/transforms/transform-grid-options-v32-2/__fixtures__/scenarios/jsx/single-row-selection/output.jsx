import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      onCellSelectionChanged={() => {}}
      onCellSelectionDeleteStart={() => {}}
      onCellSelectionDeleteEnd={() => {}}
      suppressRowClickSelection
      suppressRowDeselection
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges
      rowSelection={{
        mode: "singleRow",
        isRowSelectable: (params) => params.data.year < 2007
      }} />)
  );
}
