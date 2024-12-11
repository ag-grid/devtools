// @ts-nocheck
import { AdvancedFilterModel, ColDef, ColGroupDef, GridReadyEvent } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { IOlympicData } from './interfaces';

import { AllCommunityModule, ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

@Component({
  selector: 'my-app',
  template: `<div>
    <ag-grid-angular
      [columnDefs]="columnDefs"
      [rowData]="rowData"
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
