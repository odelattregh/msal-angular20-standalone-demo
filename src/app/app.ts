import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest, EventMessage, EventType, AuthenticationResult, SilentRequest, AccountInfo } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';

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
          <p>Please sign-in to see your profile information.</p>
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
export class App implements OnInit, OnDestroy {
  title = 'Angular Standalone MSAL';

  protected readonly ActiveAccount = signal<AccountInfo | undefined>(undefined);
  protected readonly isLogged = signal(false);
  protected readonly isIframe = signal(false);
  readonly logs = signal<string[]>([]);

  private readonly _destroying$ = new Subject<void>();

  private readonly authService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly msalGuardConfig = inject<MsalGuardConfiguration>(MSAL_GUARD_CONFIG);

  constructor() {
    this.log('[APP] Constructor');
  }

  ngOnInit(): void {
    // Remove this line to use Angular Universal
    this.isIframe.set(window !== window.parent && !window.opener);
    this.log(`[APP] ngOnInit IsIframe: ${this.isIframe()}`);

    // Adds event listener that emits an event when a user account is added or removed
    // from localstorage in a different browser tab or window
    this.authService.instance.enableAccountStorageEvents();

    // Used after first or new login or when opening a new tab (new session)
    this.msalBroadcastService.msalSubject$.pipe(
      filter((msg: EventMessage) =>
        msg.eventType === EventType.LOGIN_SUCCESS ||
        msg.eventType === EventType.ACCOUNT_ADDED ||
        msg.eventType === EventType.ACCOUNT_REMOVED),
        takeUntil(this._destroying$)
    ).subscribe((result: EventMessage) => {
      if (this.authService.instance.getAllAccounts().length === 0) {
        // ACCOUNT_ADDED || ACCOUNT_REMOVED
        this.log('[APP] ACCOUNT_ADDED || ACCOUNT_REMOVED');
        window.location.pathname = '/';
      } else {
        // LOGIN_SUCCESS
        const payload = result.payload as AuthenticationResult;
        this.authService.instance.setActiveAccount(payload.account);
        this.log(`[APP] LOGIN_SUCCESS ${payload.account.username}`);
      }
    });

    // called after login
    this.msalBroadcastService.inProgress$.pipe(
      filter((status: InteractionStatus) => status === InteractionStatus.None),
      takeUntil(this._destroying$)
    ).subscribe({
      next: () => {
        this.log('[APP] msalBroadcastService - Validate Login');
        this.checkAndSetActiveAccount();
        if (this.ActiveAccount()) {
          // Optional Acquire an application Token here
          this.acquireToken();
          // Allow login to enable <router-outlet>
          this.setLoginStatus();
        }
      },
      complete: () => {
        this.log('[APP] msalBroadcastService - Completed');
      }
    });
  }

  protected clearLog = () => this.logs.set([]);
  private log = (message: string) => this.logs.update(logs => [...logs, `[${new Date().toLocaleTimeString()}] ${message}`]);
  private setToken = (token: AuthenticationResult) => sessionStorage.setItem('accessToken', JSON.stringify(token));

  private acquireToken() {
    const activeAccount: AccountInfo | undefined = this.authService.instance.getActiveAccount() ?? undefined;
    const silentRequest: SilentRequest = { scopes: [environment.apiKey], account: activeAccount };
    this.authService.instance.acquireTokenSilent(silentRequest).then((result: AuthenticationResult) => {
      this.log(`[APP] acquireToken ${result.accessToken.substring(0, 10)}`);
      // Set token to sessionStorage for http header usage without Msal
      this.setToken(result);
    }).catch((error) => {
      console.log(`[APP] Silent token acquisition failed ${error}`);
    });
  }

  private setLoginStatus() {
    const isActive = !(this.ActiveAccount() === undefined);
    this.log(`[APP] setLoginStatus user is active : ${isActive}`);
    this.isLogged.set(isActive);
  }

  private checkAndSetActiveAccount() {
    let activeAccount: AccountInfo | null = this.authService.instance.getActiveAccount();
    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      this.log('[APP] checkAndSetActiveAccount Set Active Account');
      let accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
      activeAccount = accounts[0];
    }
    activeAccount === null ? this.ActiveAccount.set(undefined) : this.ActiveAccount.set(activeAccount);
    this.log(`[APP] checkAndSetActiveAccount : ${activeAccount?.name}`);
  }

  protected loginRedirect() {
    if (this.msalGuardConfig.authRequest) {
      const request = { ...this.msalGuardConfig.authRequest, } as RedirectRequest;
      this.authService.loginRedirect(request);
      this.log(`[APP] loginRedirect authRequest : ${request.scopes}`);
    }
    else {
      this.authService.loginRedirect();
      this.log(`[APP] loginRedirect Otherwise`);
    }
  }

  protected logout() {
    const request = { ...this.msalGuardConfig.authRequest, } as RedirectRequest;
    this.authService.logoutRedirect(request);
  }

  ngOnDestroy(): void {
    console.log('[APP]', 'ngOnDestroy');
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}