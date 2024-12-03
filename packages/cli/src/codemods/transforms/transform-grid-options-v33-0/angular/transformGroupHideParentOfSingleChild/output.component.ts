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
      [groupHideParentOfSingleChild]="true"
    ></ag-grid-angular>
  </div>`,
})
export class AppComponent {
  @ViewChild(AgGridAngular) private grid!: AgGridAngular;

  constructor(private http: HttpClient) {
  }
}
