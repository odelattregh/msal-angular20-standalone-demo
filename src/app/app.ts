import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration, MSAL_INSTANCE } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, EventMessage, EventType, AuthenticationResult, SilentRequest, AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { FoSecurity } from './services/FoSecurity';
import { FoUtils } from './services/FoUtils';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar color="primary">
      <a class="title" href="/">{{ title }}</a>
      <div class="toolbar-spacer"></div>
      <a mat-button [routerLink]="['profile']">Profile</a>
        @if (!isLogged()) {
          <button mat-menu-item (click)="loginRedirect()">Login</button>
        } @else {
          <button mat-menu-item (click)="logout()">Logout</button>
        }
    </mat-toolbar>
    <div class="container">
      <div class="log-container">
        <button (click)="clearLog()">Clear</button>
        @for (log of logs(); track $index) {
          <div>{{ log }}</div>  
        }
      </div>

      <div>
          <p class="welcome">Welcome to the MSAL Angular Quickstart!</p>
          <p>This sample demonstrates how to configure MSAL Angular to login, logout, protect a route,
              and acquire an access token for a protected resource such as the Microsoft Graph.</p>
      </div>

      <!--isIframe is to avoid reload during acquireTokenSilent() because of hidden iframe -->
      @if (!isIframe() && isLogged()) {
        <router-outlet />
      }

    </div>

  `,
  styles: `
    .toolbar-spacer { flex: 1 1 auto; }
    a.title { color: white; }
    .log-container { font-family: monospace; background: #f5f5f5; padding: 1rem; max-height: 300px; overflow-y: auto; border: 1px solid #ddd; }
  `
})
export class App extends FoUtils implements OnInit {
  title = 'Angular Standalone MSAL';

  protected readonly ActiveAccount = signal<AccountInfo | undefined>(undefined);
  protected readonly isLogged = signal(false);
  protected readonly isIframe = signal(false);
  readonly logs = signal<string[]>([]);

  protected readonly IsIframe = signal(false);
  private readonly securityService = inject(FoSecurity);
  private readonly msalState = inject<IPublicClientApplication>(MSAL_INSTANCE);
  protected clearLog = () => this.logs.set([]);
  private log = (message: string) => this.logs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ${message}`]);

  constructor() {
    super();
    this.IsIframe.update(() => window !== window.parent && !window.opener);
  }

  ngOnInit() {
    this.log('Security inititalization: in progress ...');
    this.msalState.initialize().then(() => {
      this.log('Security MSAL Initialized');
      this.securityService.initLogin().then((success: boolean) => {
        this.log(`Security initLogin : ${success}`);
        this.isLogged.set(success);

        if (success) {
          this.log(`Security Login received from msal: ${success}`);
          this.securityService.initToken().then(async (hasToken: boolean) => {
            this.log(`Security HasToken ${hasToken}`);
            if (hasToken) {
              this.log('Security HasToken: all done');
            }
          });
        }
      });
    });
  }

  protected logout(popup?: boolean) {
    this.securityService.logout(popup);
  }

  protected loginRedirect() {
    this.securityService.initLogin();
  }

}