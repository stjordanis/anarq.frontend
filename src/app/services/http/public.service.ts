/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
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
import { ResultModel, ResultAuditModel } from 'src/app/models/result-model';
import { VerifyEmailModel } from 'src/app/models/verify-email-model';
import { RegionsModel } from 'src/app/models/regions-model';
import { CaseModel } from 'src/app/models/case-model';
import { StatisticsModel } from 'src/app/models/statistics-model';
import { UserSlimModel } from 'src/app/models/user-slim-model';
import { FirstCaseModel } from 'src/app/models/first-case';
import { LanguageModel } from 'src/app/models/language-model';
import { TranslationModel } from 'src/app/models/translation-model';
import { Pass } from 'codemirror';

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
      encodeURIComponent(username) +
      '&password=' +
      encodeURIComponent(password));
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

  getStatistics() {
    return this.httpClient.get<StatisticsModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/meta/statistics');
  }

  /*
   * Cases endpoints.
   */

  /**
   * Returns all open cases in system.
   * 
   * @param args Generic filter condition for which open cases to return
   */
  getOpenCases(
    offset: number = null,
    region: string = null,
    username: string = null,
    sorting: string = null): Observable<CaseSlim[]> {
    let query = '';
    if (offset) {
      query += '?offset=' + offset;
    }
    if (region) {
      if (query.includes('?')) {
        query += '&';
      } else {
        query += '?';
      }
      query += 'region=' + encodeURIComponent(region);
    }
    if (username) {
      if (query.includes('?')) {
        query += '&';
      } else {
        query += '?';
      }
      query += 'username=' + encodeURIComponent(username);
    }
    if (sorting) {
      if (query.includes('?')) {
        query += '&';
      } else {
        query += '?';
      }
      query += 'sorting=' + encodeURIComponent(sorting);
    }
    return this.httpClient.get<CaseSlim[]>(
      environment.apiUrl +
      'magic/modules/anarq/public/cases/cases' +
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
      'magic/modules/anarq/public/cases/case?id=' +
      id);
  }

  /**
   * Votes for a specific case.
   * 
   * @param id ID of case to cast vote for
   * @param vote True if yes, otherwise false
   */
  vote(id: number, vote: boolean) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/votes/vote', {
        id,
        vote,
      });
  }

  /*
   * Localization endpoints.
   */

  /**
   * Returns all languages system supports.
   */
  getLanguages() {
    return this.httpClient.get<LanguageModel[]>(
      environment.apiUrl +
      'magic/modules/anarq/public/meta/languages');
  }

  /**
   * Returns all translations in system for the given locale.
   */
  getTranslations(locale: string) {
    return this.httpClient.get<TranslationModel[]>(
      environment.apiUrl +
      'magic/modules/anarq/public/meta/translations?locale=' +
      encodeURIComponent(locale));
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
      'magic/modules/anarq/public/users/user?username=' +
      encodeURIComponent(username));
  }

  /**
   * Returns true if user has not created any cases yet.
   */
  isFirstCase() {
    return this.httpClient.get<FirstCaseModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/is-first-case');
  }

  /**
   * Checks to see if the specified username is available or not.
   * 
   * @param username Username to check
   */
  usernameAvailable(username: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/username-available?username=' +
      encodeURIComponent(username));
  }

  /**
   * Checks to see if specified email address is available or not.
   * 
   * @param email Email address to check
   */
  emailAvailable(email: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/email-available?email=' +
      encodeURIComponent(email));
  }

  /**
   * Checks to see if specified phone number is available or not.
   * 
   * @param phone Phone number to check
   */
  phoneAvailable(phone: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/phone-available?phone=' +
      encodeURIComponent(phone));
  }

  /**
   * Registers a user on the site, with the specified data.
   * 
   * @param model Data to register
   */
  register(model: RegisterModel) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/register',
      model);
  }

  /**
   * Verifies a user's email address.
   * 
   * @param model Email address and hash generated during signup
   */
  verifyEmail(model: VerifyEmailModel) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/verify-email',
      model);
  }

  /**
   * Returns all regions in system.
   */
  getRegions() {
    return this.httpClient.get<RegionsModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/regions/regions');
  }

  /**
   * Returns all regions in system associated with the currently logged in user.
   */
  getMyRegions() {
    return this.httpClient.get<RegionsModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/regions/my-regions');
  }

  /**
   * Returns true if user is allowed to set his regions.
   */
  canSetRegions() {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/regions/can-set-region');
  }

  /**
   * Used during registration of user to associate user with one region.
   * 
   * @param region Region to associate user with
   */
  setRegion(region: string) {
    return this.httpClient.put<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/set-region', {
        region
      });
  }

  /**
   * Checks to see if the currently logged in user can legally create
   * a new case within the specified region.
   * 
   * @param region Region to check
   */
  canCreateCase(region: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/cases/can-create-case?region=' +
      encodeURIComponent(region));
  }

  /**
   * Submits a new case to the backend.
   * 
   * @param model Case data
   */
  submitCase(model: CaseModel) {
    return this.httpClient.post<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/cases/create-case',
      model);
  }

  /**
   * Returns users in system by popularity.
   */
  getUsers(offset: number, filter: string = null) {
    let query = '?offset=' + offset;
    if (filter) {
      query += '&filter=' + encodeURIComponent(filter);
    }
    return this.httpClient.get<UserSlimModel[]>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/users' +
      query);
  }

  /**
   * Returns all open cases in system.
   * 
   * @param args Generic filter condition for which open cases to return
   */
  getUserCases(username: string, offset: number = 0): Observable<CaseSlim[]> {
    let query = '?username=' + encodeURIComponent(username);
    if (offset) {
      query += '&offset=' + offset;
    }
    return this.httpClient.get<CaseSlim[]>(
      environment.apiUrl +
      'magic/modules/anarq/public/cases/users-cases' +
      query);
  }

  /**
   * Audits a single vote, by verifying its hash value, towards the
   * previous vote's hash value.
   * 
   * @param hash Hash of vote to audit
   */
  auditVote(hash: string) {
    return this.httpClient.get<ResultAuditModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/votes/audit?hash=' +
      encodeURIComponent(hash));
  }

  /**
   * Sends the user a reset password link.
   * 
   * @param email Email address used during registration
   */
  sendPasswordResetLink(email: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/send-reset-password-link?email=' +
      encodeURIComponent(email));
  }

  /**
   * 
   * @param username Username for user to change password of.
   * @param newPassword New password for user.
   * @param hash Hash value as sent in email when giving user a reset password link.
   */
  resetPassword(username: string, newPassword: string, hash: string) {
    return this.httpClient.get<ResultModel>(
      environment.apiUrl +
      'magic/modules/anarq/public/users/reset-password?username=' +
      encodeURIComponent(username) + 
      '&newPassword=' +
      encodeURIComponent(newPassword) +
      '&hash=' +
      encodeURIComponent(hash));
  }
}
