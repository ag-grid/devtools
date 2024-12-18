import { createGrid } from '@ag-grid-community/core';

const gridApi = createGrid(document.body, {
  columnDefs: [
    {
      colId: 'foo',
    },
    {
      colId: 'bar',
      suppressHeaderMenuButton: false,
      columnChooserParams: {
        suppressSyncLayoutWithGrid: true,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
    },
    {
      colId: 'baz',
      suppressHeaderMenuButton: true,
      columnChooserParams: {
        suppressSyncLayoutWithGrid: false,
      },
      floatingFilterComponentParams: {
        suppressFilterButton: false,
      },
    }
  ],
  rowData: [],
  cellFlashDuration: 1000,
  cellFadeDuration: 3000,
});

gridApi.getDisplayedRowAtIndex(3);
gridApi?.getDisplayedRowAtIndex(3);
gridApi.getRowNode('foo');
gridApi?.getRowNode('foo');
gridApi.getDisplayedRowCount();
gridApi.getDisplayedRowCount() === 0;
gridApi.forEachNode(() => {});
gridApi.forEachNode(() => {}, true);
gridApi?.forEachNode(() => {}, true);
gridApi.getFirstDisplayedRowIndex();
gridApi?.getFirstDisplayedRowIndex();
gridApi.getLastDisplayedRowIndex();
gridApi?.getLastDisplayedRowIndex();
gridApi.getColumnFilterInstance('foo');
gridApi?.getColumnFilterInstance('foo', () => {});
gridApi.flashCells({
  flashDuration: 1000,
  fadeDuration: 3000,
  foo: true
});
gridApi.removeRowGroupColumns(['foo']);
gridApi.addRowGroupColumns(['foo']);
gridApi.setColumnsPinned(['foo'], true);
gridApi.removePivotColumns(['foo']);
gridApi.addPivotColumns(['foo']);
gridApi.addAggFunc({
  foo: () => {}
});
gridApi.addAggFunc({
  'foo bar': () => {}
});
gridApi.addAggFunc({
  [(() => 'foo')()]: () => {}
});
gridApi.removeValueColumns(['foo']);
gridApi.addValueColumns(['foo']);
gridApi.autoSizeColumns(['foo']);
gridApi.autoSizeColumns(['foo'], true);
gridApi.moveColumns(['foo'], 3);
gridApi.setColumnWidths(['foo'], 300);
gridApi.setColumnWidths(['foo'], 300, true);
gridApi.setColumnWidths(['foo'], 300, true, 'api');
gridApi.setColumnsVisible(['foo'], true);
gridApi?.showColumnMenuAfterButtonClick('foo', document.body.firstChild);
gridApi.showColumnMenuAfterMouseEvent('foo', new MouseEvent('click'));
