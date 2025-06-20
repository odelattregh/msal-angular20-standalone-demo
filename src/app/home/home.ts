import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div>
        <p>[Home] Login successful!</p>
        <p>[Home] Request your profile information by clicking Profile above.</p>
        <p>[Home] Token in sessionStorage:</p>
    </div>
    <div class="log-container">
      <div>{{getToken()}}</div>
    </div>
  `,
  styles: `
    .log-container { font-family: monospace; background: #f5f5f5; padding: 1rem; max-height: 300px; overflow-y: auto; border: 1px solid #ddd; }
  `
})
export class HomeComponent {

  protected getToken = (): string | null => this.getTokenKey() ? JSON.parse(this.getTokenKey() as string).accessToken : null;
  private getTokenKey = (): string | null => sessionStorage.getItem('accessToken');

  constructor() { }
}