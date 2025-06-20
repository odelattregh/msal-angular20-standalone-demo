import { Routes } from '@angular/router';
import { LoginFailedComponent } from './status/login-failed';
import { LougoutFailedComponent } from './status/logout-failed';
import { LougoutSuccessComponent } from './status/logout-success';
import { HomeComponent } from './home/home';
import { ProfileComponent } from './profile/profile';
import { MsalGuard } from '@azure/msal-angular';

export const routes: Routes = [
  { path: 'profile', component: ProfileComponent, canActivate: [MsalGuard] },
  { path: '', component: HomeComponent, canActivate: [MsalGuard] },
  { path: 'login-failed', component: LoginFailedComponent },
  { path: 'logout-failed', component: LougoutFailedComponent },
  { path: 'logout-success', component: LougoutSuccessComponent },
];