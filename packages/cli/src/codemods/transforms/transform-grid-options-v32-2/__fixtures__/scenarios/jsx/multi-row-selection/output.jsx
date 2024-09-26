import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      rowSelection={{
        mode: "multiRow",
        isRowSelectable: (params) => params.data.year < 2007,
        enableSelectionWithoutKeys: true
      }}
      onCellSelectionChanged={() => {}}
      onCellSelectionDeleteStart={() => {}}
      onCellSelectionDeleteEnd={() => {}}
      suppressRowClickSelection
      suppressRowDeselection
      groupSelectsChildren
      groupSelectsFiltered
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges />)
  );
}
