// @ts-nocheck
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './component.html',
})
export class AppComponent {
  constructor(public active: boolean) {}
}
