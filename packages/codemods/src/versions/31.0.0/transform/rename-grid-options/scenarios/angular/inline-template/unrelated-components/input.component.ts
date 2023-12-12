// @ts-nocheck
/* eslint-disable */
import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <div>
      <h1 [class.active]="active">Hello, world!</h1>
    </div>
  `,
})
export class AppComponent {
  constructor(public active: boolean) {}
}
