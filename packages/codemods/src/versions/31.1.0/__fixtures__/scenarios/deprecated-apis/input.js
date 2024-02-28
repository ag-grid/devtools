import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      suppressMenu: false,
      columnsMenuParams: {
        suppressSyncLayoutWithGrid: true,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    {
      colId: 'baz',
      suppressMenu: true,
      columnsMenuParams: {
        suppressSyncLayoutWithGrid: false,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: false,
      },
    }
  ],
  rowData: [],
  cellFlashDelay: 1000,
  cellFadeDelay: 3000,
});

gridApi.getModel().getRow(3);
gridApi.getModel().getRowNode('foo');
gridApi.getModel().getRowCount();
gridApi.getModel().isEmpty();
gridApi.getModel().forEachNode(() => {});
gridApi.getModel().forEachNode(() => {}, true);
gridApi.getFirstDisplayedRow();
gridApi.getLastDisplayedRow();
gridApi.getFilterInstance('foo');
gridApi.getFilterInstance('foo', () => {});
gridApi.flashCells({
  flashDelay: 1000,
  fadeDelay: 3000,
  foo: true,
});
gridApi.removeRowGroupColumn('foo');
gridApi.addRowGroupColumn('foo');
gridApi.setColumnPinned('foo', true);
gridApi.removePivotColumn('foo');
gridApi.addPivotColumn('foo');
gridApi.addAggFunc('foo', () => {});
gridApi.addAggFunc('foo bar', () => {});
gridApi.addAggFunc((() => 'foo')(), () => {});
gridApi.removeValueColumn('foo');
gridApi.addValueColumn('foo');
gridApi.autoSizeColumn('foo');
gridApi.autoSizeColumn('foo', true);
gridApi.moveColumn('foo', 3);
gridApi.setColumnWidth('foo', 300);
gridApi.setColumnWidth('foo', 300, true);
gridApi.setColumnWidth('foo', 300, true, 'api');
gridApi.setColumnVisible('foo', true);
gridApi.showColumnMenuAfterButtonClick('foo', document.body.firstChild);
gridApi.showColumnMenuAfterMouseEvent('foo', new MouseEvent('click'));
