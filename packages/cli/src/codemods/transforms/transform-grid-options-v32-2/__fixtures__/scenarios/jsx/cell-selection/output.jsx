import { AgGridReact } from '@ag-grid-community/react';

const suppressMultiRangeSelection = true;
const suppressClearOnFillReduction = true;

function onRangeSelectionChanged() {}

function foo() {}

function MyComponent (props) {
  return (
    (<AgGridReact
      columnDefs={[]}
      rowData={[]}
      onCellSelectionChanged={onRangeSelectionChanged}
      onCellSelectionDeleteStart={foo}
      onCellSelectionDeleteEnd={() => {}}

      cellSelection={true}
      enableRangeHandle={true}
      suppressMultiRangeSelection={suppressMultiRangeSelection}
      suppressClearOnFillReduction={suppressClearOnFillReduction}

      suppressCopyRowsToClipboard={true}
      suppressCopySingleCellRanges={true}
    />)
  );
}
