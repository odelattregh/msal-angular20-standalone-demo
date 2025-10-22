import { Routes } from '@angular/router';
import { LoginFailedComponent } from './status/login-failed';
import { LougoutFailedComponent } from './status/logout-failed';
import { LougoutSuccessComponent } from './status/logout-success';
import { ProfileComponent } from './profile/profile';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  { path: '', title: 'Home', loadComponent: () => import('./home/home').then(m => m.HomeComponent), canActivate: [MsalGuard], pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent, canActivate: [MsalGuard] },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'logout-failed', component: LougoutFailedComponent },
  { path: 'logout-success', component: LougoutSuccessComponent },
];