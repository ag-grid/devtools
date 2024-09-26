import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {  
  const [selectionState, setSelectionState] = useState("single");

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
        isRowSelectable: (params) => params.data.year < 2007
      }} />)
  );
}
