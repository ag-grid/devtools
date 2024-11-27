import { AgGridReact } from '@ag-grid-community/react';

function MyComponent(props) {

  const shouldntChange0 = {
    sparklineOptions: {
      type: 'column'
    }
  }

  const anotherColumn = {
    field: 'test',
    cellRenderer: 'agSparklineCellRenderer',
    cellRendererParams: {
      sparklineOptions: {
        type: 'bar',
        direction: 'vertical'
      }
    }
  }

  return (
    (<div>
      <AgGridReact columnDefs={[{
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        cellRendererParams: {
          sparklineOptions: {
            type: 'line'
          }
        }
      }, {
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        cellRendererParams: {
          sparklineOptions: {
            type: 'area'
          }
        }
      }, {
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        sparklineOptions: {
          type: 'bar'
        }
      }, {
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        cellRendererParams: {
          sparklineOptions: {
            type: 'bar',
            direction: 'vertical'
          }
        }
      }, anotherColumn, {
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        sparklineOptions: {
          type: 'column'
        }
      }, {
        field: 'test',
        cellRenderer: 'agSparklineCellRenderer',
        sparklineOptions: {
          type: 'asdadasqda'
        }
      }]} rowData={[]}/>
    </div>)
  );
}
