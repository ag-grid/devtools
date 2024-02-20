// @ts-nocheck
/* eslint-disable */
import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
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
  public columnDefs: (ColDef | ColGroupDef)[] = [];
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {}

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    const { api: gridApi } = params;
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
        gridApi.resetColumnState();
      });
  }
}
