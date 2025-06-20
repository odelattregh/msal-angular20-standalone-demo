# MsalDemo

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.0.

# MSAL Angular 20 Standalone Demo

This is a working example of how to integrate **Microsoft Authentication Library (MSAL)** with a **standalone Angular 20 application** using:

- `@azure/msal-angular@4.0.12`
- `@azure/msal-browser@4.13.2`
- Standalone components and routing
- Signal-based state management
- Angular Material for UI

## ✅ Features

- 🔒 Azure AD login with MSAL Redirect flow
- 🎯 Route protection using `MsalGuard`
- 💾 Access token acquisition using `acquireTokenSilent`
- 🔄 Session restoration using `handleRedirectObservable`
- 🚦 Signal-based login status and active account tracking
- 📋 Protected Graph API request configuration
- 🎨 Clean UI using Angular Material

## 🧰 Technologies Used

- Angular 20.0.4 (Standalone API)
- @azure/msal-browser 4.13.2
- @azure/msal-angular 4.0.12
- Angular Material 20.0.3
- RxJS 7.8
- Signal-based state (`@angular/core` signals)

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/odelattregh/msal-angular20-standalone-demo.git
cd msal-angular20-standalone-demo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your environment
Update src/environments/environment.ts with your Azure AD app registration:

```bash
export const environment = {
  production: false,
  msalConfig: {
    clientId: '<your-client-id>',
    tenantId: '<your-tenant-id>',
  },
  apiKey: 'user.read', // or your custom API scope
};
```

### 3. Run the app
```bash
ng serve
```

🧪 MSAL Login Flow

1. Redirect login is triggered via MsalService.loginRedirect()
2. On return, handleRedirectObservable()processes the response
3. Active account is set
4. acquireTokenSilent() fetches access token
5. Token is stored in session storage (can be accessed directly if needed)

🛠️ Customization Tips

Change
{ path: '', component: HomeComponent, canActivate: [MsalGuard] },

with to log with the login button
{ path: '', component: HomeComponent },

IMPORTANT:
Use "@azure/msal-angular": "^4.0.12"
Version 4.0.13 is not building a dist folder creating errors.

Enjoy !