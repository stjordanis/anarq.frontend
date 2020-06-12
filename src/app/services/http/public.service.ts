/*
 * Anarchy, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

 // System includes
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Custom includes
import { environment } from 'src/environments/environment';
import { CaseSlim } from 'src/app/models/case-slim';
import { CaseView } from 'src/app/models/case-view';
import { UserView } from 'src/app/models/user-view';
import { RegisterModel } from 'src/app/models/register-model';
import { ResultModel } from 'src/app/models/result-model';
import { VerifyEmailModel } from 'src/app/models/verify-email-model';

/*
 * Your main HTTP service for handling cases, and related objects.
 */
@Injectable({
  providedIn: 'root'
})
export class PublicService {

  constructor(private httpClient: HttpClient) { }

  /*
   * Authenticate endpoints, and helpers.
   */

  /**
   * Authenticates a user, returning a JWT ticket to caller.
   * 
   * @param username Username you are trying to authenticate
   * @param password Password for user
   */
  authenticate(username: string, password: string) {
    return this.httpClient.get<any>(
      environment.apiUrl +
      'magic/modules/system/auth/authenticate?username=' +
      encodeURI(username) +
      '&password=' +
      encodeURI(password));
  }

  /**
   * Will create a new JWT ticket with a new expiration date, by using
   * the existing JWT ticket for authenticating user.
   */
  refreshTicket() {
    return this.httpClient.get<any>(
      environment.apiUrl +
      'magic/modules/system/auth/refresh-ticket');
  }

  /**
   * Changes the currect password for the currently authenticated user.
   * 
   * @param password New password for user
   */
  changeMyPassword(password: string) {
    return this.httpClient.put<any>(
      environment.apiUrl +
      'magic/modules/system/auth/change-password', {
      password,
    });
  }

  /*
   * Cases endpoints.
   */

  /**
   * Returns all open cases in system.
   * 
   * @param args Generic filter condition for which open cases to return
   */
  getOpenCases(fromId: number = null, region: string = null): Observable<CaseSlim[]> {
    let query = '';
    if (fromId) {
      query += '?id.lt=' + fromId;
      if (region !== null) {
        query += '&region.eq=' + region;
      }
    } else if (region !== null) {
      query += '?region.eq=' + region;
    }
    return this.httpClient.get<CaseSlim[]>(
      environment.apiUrl +
      'magic/modules/anarchy/public/cases/open-cases' +
      query);
  }

  /**
   * Returns the specified case to caller.
   * 
   * @param id Case ID to return
   */
  getCase(id: number) {
    return this.httpClient.get<CaseView>(
      environment.apiUrl +
      'magic/modules/anarchy/public/cases/case?id=' +
      id);
  }

  /**
   * Votes for a specific case.
   * 
   * @param id ID of case to cast vote for
   * @param vote True if yes, otherwise false
   */
  vote(id: number, vote: boolean) {
    return this.httpClient.post<any>(
      environment.apiUrl +
      'magic/modules/anarchy/public/cases/vote', {
        id,
        vote,
      });
  }

  /*
   * User endpoints.
   */

  /**
   * Returns meta information about a single user in the system.
   * 
   * @param username Username of user to return to caller.
   */
  getUser(username: string) {
    return this.httpClient.get<UserView>(
      environment.apiUrl +
      'magic/modules/anarchy/public/users/user?username=' +
      username);
  }

  /**
   * Checks to see if the specified username is available or not.
   * 
   * @param username Username to check
   */
  usernameAvailable(username: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarchy/public/users/username-available?username=' +
      username);
  }

  /**
   * Checks to see if specified email address is available or not.
   * 
   * @param email Email address to check
   */
  emailAvailable(email: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarchy/public/users/email-available?email=' +
      email);
  }

  /**
   * Registers a user on the site, with the specified data.
   * 
   * @param model Data to register
   */
  register(model: RegisterModel) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarchy/public/users/register',
      model);
  }

  verifyEmail(model: VerifyEmailModel) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarchy/public/users/verify-email',
      model);
  }
}
