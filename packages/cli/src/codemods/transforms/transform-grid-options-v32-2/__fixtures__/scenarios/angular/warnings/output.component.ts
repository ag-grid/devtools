// @ts-nocheck
import { AdvancedFilterModel, ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { IOlympicData } from './interfaces';

@Component({
  selector: 'my-app',
  template: `<div>
    <ag-grid-angular
      [columnDefs]="columnDefs"
      [rowData]="rowData"
      [rowSelection]="single"
      [suppressRowClickSelection]="true"
      [suppressRowDeselection]="true"
      [isRowSelectable]="true"
      [rowMultiSelectWithClick]="true"
      [groupSelectsChildren]="true"
      [groupSelectsFiltered]="true"
      [cellSelection]="true"
      [suppressMultiRangeSelection]="true"
      [suppressClearOnFillReduction]="true"
      [enableRangeHandle]="true"
      [enableFillHandle]="true"
      [fillHandleDirection]="true"
      [fillOperation]="fillOperation($params)"
      [suppressCopyRowsToClipboard]="true"
      [suppressCopySingleCellRanges]="true"
      (gridReady)="onGridReady($event)"
    ></ag-grid-angular>
  </div>`,
})
export class AppComponent {
  @ViewChild(AgGridAngular) private grid!: AgGridAngular;
  public columnDefs: (ColDef | ColGroupDef)[] = [];
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {
  }

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
        console.log("Hello, world!");
      });
  }
}
