// @ts-nocheck
import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { IOlympicData } from './interfaces';

@Component({
  selector: 'my-app',
  template: `
    <div>
      <ag-grid-angular
        #my_grid
        [columnDefs]="columnDefs"
        [rowData]="rowData"
        (gridReady)="onGridReady($event)"
      ></ag-grid-angular>
    </div>
  `,
})
export class AppComponent {
  @ViewChild('my_grid') private grid!: AgGridAngular;
  public columnDefs: (ColDef | ColGroupDef)[] = [];
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {}

  resetState() {
    this.grid.api.resetColumnState();
    this.grid?.api.resetColumnState();
    this.grid!.api.resetColumnState();

    this.grid?.api?.resetColumnState();
    this.grid!.api!.resetColumnState();
  }

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}
