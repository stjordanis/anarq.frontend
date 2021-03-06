/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/*
 * Service that helps you determine if there is an ongoing HTTP request
 * towards your backend or not.
 * Used to display "spinner".
 */
@Injectable()
export class LoaderService {

  // If true, one or more Ajax requests are currently going towards your backend.
  public isLoading = new BehaviorSubject<boolean>(false);

  // Changes the state to "is loading".
  show() {
    setTimeout(() => {
      this.isLoading.next(true);
    });
  }

  // Changes the state to "is NOT loading".
  hide() {
    setTimeout(() => {
      this.isLoading.next(false);
    });
  }
}
