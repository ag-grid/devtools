// @ts-nocheck
/* eslint-disable */
import { AdvancedFilterModel, ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { IOlympicData } from './interfaces';

@Component({
  selector: 'my-app',
  templateUrl: './input.component.html',
})
export class AppComponent {
  @ViewChild(AgGridAngular) private grid!: AgGridAngular;
  public columnDefs: (ColDef | ColGroupDef)[] = [];
  public rowData!: IOlympicData[];
  public advancedFilterModel: AdvancedFilterModel;

  constructor(private http: HttpClient) {
    this.advancedFilterModel = {
      filterType: 'join',
      type: 'AND',
      conditions: [],
    };
  }

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}
