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
      groupSelectsChildren
      groupSelectsFiltered
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges
      selection={{
        mode: "multiRow",
        isRowSelectable: (params) => params.data.year < 2007,
        enableMultiSelectWithClick: true
      }} />)
  );
}
