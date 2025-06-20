import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

type ProfileType = {
  givenName?: string;
  surname?: string;
  userPrincipalName?: string;
  id?: string;
};

@Component({
  selector: 'app-profile',
  providers: [HttpClient],
  template: `
  <div>
      <p><strong>First Name: </strong> {{profile?.givenName}}</p>
      <p><strong>Last Name: </strong> {{profile?.surname}}</p>
      <p><strong>Email: </strong> {{profile?.userPrincipalName}}</p>
      <p><strong>Id: </strong> {{profile?.id}}</p>
  </div>  
  `
})
export class ProfileComponent implements OnInit {

  protected profile: ProfileType | undefined;
  private readonly http = inject(HttpClient);

  constructor() { }

  ngOnInit() {
    this.getProfile('https://graph.microsoft.com/v1.0/me');
  }

  getProfile(url: string) { this.http.get(url).subscribe((profile) => this.profile = profile); }
}