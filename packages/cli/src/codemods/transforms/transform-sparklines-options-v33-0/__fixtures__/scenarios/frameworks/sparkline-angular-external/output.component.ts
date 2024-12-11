// @ts-nocheck
import { ColDef, ColGroupDef, GridReadyEvent } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { HttpClient } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { IOlympicData } from './interfaces';

@Component({
  selector: 'my-app',
  templateUrl: './component.html',
})
export class AppComponent {
  @ViewChild(AgGridAngular) private grid!: AgGridAngular;
  public columnDefs: (ColDef | ColGroupDef)[] = [{field: 'test', cellRenderer: 'agSparklineRenderer', cellRendererParams: {sparklineOptions: {
    type: 'bar',
    direction: 'vertical'
  }}}];
  public rowData!: IOlympicData[];

  constructor(private http: HttpClient) {
  }

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.http
      .get<IOlympicData[]>('https://www.ag-grid.com/example-assets/olympic-winners.json')
      .subscribe((data) => {
        this.rowData = data;
      });
  }
}
