import { isDevMode, Injectable, inject } from "@angular/core";
import { filter, take } from 'rxjs/operators';
import { FoUtils } from "./FoUtils";

// Authentication
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus, SilentRequest } from "@azure/msal-browser";
import { AuthenticationResult } from "@azure/msal-common";
import { Router } from "@angular/router";
import { APP_CONFIG, IConfiguration } from "../models/IConfiguration";

@Injectable()
export class FoSecurity extends FoUtils {

  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly router = inject(Router);
  private readonly Config: IConfiguration | null = inject(APP_CONFIG, { optional: true });

  constructor() {
    super();
    this.debug('Services', 'Security', 'Constructor', `${isDevMode() ? 'Development!' : 'Production!'}`);
  }

  public initLogin(timeoutMs = 5000): Promise<boolean> {
    this.debug('Services', 'Security', 'initLogin', 'start');
    return new Promise((resolve) => {
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        this.debug('Services', 'Security', 'initLogin', true);
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        this.debug('Services', 'Security', 'Login timeout fallback');
        resolve(false);
      }, timeoutMs);

      this.msalBroadcastService.msalSubject$
        .pipe(
          filter((message: EventMessage) =>
            message.eventType === EventType.LOGIN_SUCCESS ||
            message.eventType === EventType.LOGIN_FAILURE ||
            message.eventType === EventType.ACCOUNT_ADDED ||
            message.eventType === EventType.ACCOUNT_REMOVED
          ), take(1))
        .subscribe((message: EventMessage) => {
          clearTimeout(timeout);
          const loginSuccess = message.eventType === EventType.LOGIN_SUCCESS;
          this.debug('Services', 'Security', 'Login event received', message);
          resolve(loginSuccess);
        });
    });
  }

  // Always After Authentication or Cache Login exists
  public async initToken(timeoutMs = 5000): Promise<boolean> {
    this.debug('Services', 'Security', 'initToken', 'start');
    return new Promise((resolve) => {

      const timeout = setTimeout(() => {
        this.debug('Services', 'Security', 'Token timeout fallback');
        resolve(false);
      }, timeoutMs);

      this.msalBroadcastService.inProgress$
        .pipe(filter((status: InteractionStatus) => status === InteractionStatus.None), take(1))
        .subscribe(async () => {
          clearTimeout(timeout);
            this.debug('Services', 'Security', 'Token', 'Retrieving Token...');
            await this.acquireToken();
            this.debug('Services', 'Security', 'Token', 'Token Acquired');
            this.router.navigate(['']);
            resolve(true);
        })
    })

  }

  private async acquireToken(): Promise<void> {
    if (this.Config) {
      const silentRequest: SilentRequest = {
        scopes: [`api://${this.Config?.API_CLIENT_ID}/${this.Config?.API_CLIENT_ACCESS}`],
        account: this.msalService.instance.getAllAccounts()[0],
      };
      const result: AuthenticationResult = await this.msalService.instance.acquireTokenSilent(silentRequest);
      this.debug('Services', 'Security', 'acquireToken', result);
    } else {
      this.error('Services', 'Security', 'acquireToken', 'Configuration is not set');
    }
  }

  logout(popup?: boolean) {
    if (popup) this.msalService.logoutPopup({ mainWindowRedirectUri: "/" });
    else this.msalService.logoutRedirect({ postLogoutRedirectUri: location.origin });
  }

}
