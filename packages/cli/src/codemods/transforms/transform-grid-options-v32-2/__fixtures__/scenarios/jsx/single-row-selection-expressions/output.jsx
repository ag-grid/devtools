import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  const [selectionState, setSelectionState] = useState("single");

  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      rowSelection={selectionState}
      onCellSelectionChanged={() => {}}
      onCellSelectionDeleteStart={() => {}}
      onCellSelectionDeleteEnd={() => {}}
      suppressRowClickSelection
      suppressRowDeselection
      suppressCopyRowsToClipboard
      suppressCopySingleCellRanges
      selection={{
        isRowSelectable: (params) => params.data.year < 2007
      }} />)
  );
}
