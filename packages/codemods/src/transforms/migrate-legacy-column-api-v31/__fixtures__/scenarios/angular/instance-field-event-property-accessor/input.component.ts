// @ts-nocheck
import { ColDef, ColGroupDef, GridApi, GridReadyEvent } from '@ag-grid-community/core';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { IOlympicData } from './interfaces';

@Component({
  selector: 'my-app',
  template: `
    <div>
      <ag-grid-angular
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        (gridReady)="onGridReady($event)"
      ></ag-grid-angular>
    </div>
  `,
})
export class AppComponent {
  private gridApi!: GridApi<IOlympicData>;
  public columnDefs: (ColDef | ColGroupDef)[] = [];
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {}

  resetState() {
    this.gridApi?.resetColumnState();
    this.gridApi!.resetColumnState();
  }

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.gridApi = params.columnApi;
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}
