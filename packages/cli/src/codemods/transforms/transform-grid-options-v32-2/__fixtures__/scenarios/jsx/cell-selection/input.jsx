import { AgGridReact } from '@ag-grid-community/react';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

function MyComponent (props) {
  return (
    <AgGridReact 
      columnDefs={[]}
      rowData={[]}
      onRangeSelectionChanged={onRangeSelectionChanged}
      onRangeDeleteStart={foo}
      onRangeDeleteEnd={() => {}}

      enableRangeSelection={true}
      enableRangeHandle={true}
      suppressMultiRangeSelection={suppressMultiRangeSelection}
      suppressClearOnFillReduction={suppressClearOnFillReduction}

      suppressCopyRowsToClipboard={true}
      suppressCopySingleCellRanges={true}
    />
  )
}
