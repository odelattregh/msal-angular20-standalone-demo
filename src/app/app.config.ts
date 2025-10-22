import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, withFetch } from '@angular/common/http';
import { IPublicClientApplication, PublicClientApplication, InteractionType, BrowserCacheLocation, LogLevel } from '@azure/msal-browser';
import { MsalInterceptorConfiguration, MsalGuardConfiguration, MsalGuard, MsalModule } from '@azure/msal-angular';
import { APP_CONFIG } from './models/IConfiguration';
import { environment as env } from '../environments/environment';
import { FoSecurity } from './services/FoSecurity';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_CONFIG, useValue: {
        TENANT_ID: env.msalConfig.TENANT_ID,
        CLIENT_ID: env.msalConfig.CLIENT_ID,
        REDIRECT_URI: env.msalConfig.REDIRECT_URI,
        ENDPOINT_URI: env.msalConfig.ENDPOINT_URI,
        API_CLIENT_ID: env.msalConfig.API_CLIENT_ID,
        API_CLIENT_ACCESS: env.msalConfig.API_CLIENT_ACCESS
      }
    },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi(), withFetch()),
    importProvidersFrom(MsalModule.forRoot(MSALInstanceFactory(), MSALGuardConfigFactory(), MSALInterceptorConfigFactory())),
    MsalGuard,
    FoSecurity
  ],
};

export function loggerCallback(logLevel: LogLevel, message: string) {
  console.log(message, logLevel);
}

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: env.msalConfig.CLIENT_ID,
      authority: `https://login.microsoftonline.com/${env.msalConfig.TENANT_ID}`,
      redirectUri: env.msalConfig.REDIRECT_URI,
      postLogoutRedirectUri: env.msalConfig.REDIRECT_URI,
      navigateToLoginRequestUrl: true
    },
    cache: {
      cacheLocation: BrowserCacheLocation.SessionStorage,
    },
    system: {
      allowPlatformBroker: false,
      loggerOptions: {
        loggerCallback,
        logLevel: LogLevel.Error,
        piiLoggingEnabled: false
      }
    }
  });
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  return {
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
      ['https://graph.microsoft.com/v1.0/me', ['user.read']],
      [env.msalConfig.ENDPOINT_URI, [`api://${env.msalConfig.API_CLIENT_ID}/${env.msalConfig.API_CLIENT_ACCESS}`]]
    ])
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: { scopes: ['user.read'] },
    loginFailedRoute: '/login-failed'
  };
}

