import { InjectionToken } from "@angular/core";

export interface IConfiguration {
    TENANT_ID: string;
    CLIENT_ID: string;
    ENDPOINT_URI: string;
    REDIRECT_URI: string;
    AUTHORITY_DOMAIN: string;
    API_CLIENT_ID: string;
    API_CLIENT_ACCESS: string;
}

export const APP_CONFIG = new InjectionToken<IConfiguration>('APP_CONFIG');