/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Component, Inject, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatSnackBar
} from '@angular/material';
import { BaseComponent } from '../helpers/base.component';
import { PublicService } from '../services/http/public.service';

/*
 * Input data to dialog.
 */
export interface DialogData {
  ticket?: string;
}

/*
 * Modal dialog for editing your existing Case_types entity types, and/or
 * creating new entity types.
 */
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;
  public email: string;
  public canRequestNewPassword = true;
  public forgotPasswordClicked = false;

  /*
   * Constructor taking a bunch of services injected using dependency injection.
   */
  constructor(
    public dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar,
    private service: PublicService) { }

  /**
   * OnInit implementation, simply checks if user can request a new password.
   */
  ngOnInit() {
    const canRequestNewPassword = localStorage.getItem('canRequestNewPassword');
    if (canRequestNewPassword) {
      this.canRequestNewPassword = false;
    }
  }

  /**
   * Logs user in by authenticating him or her towards the backend.
   */
  public login() {
    this.service.authenticate(this.username, this.password).subscribe(res => {
      this.dialogRef.close({
        ticket: res.ticket,
      });
    }, error => {
      // Oops, error!
      this.snackBar.open(error.error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    });
  }

  /**
   * Invoked when user cancels edit/create operation.
   */
  public cancel() {
    this.dialogRef.close();
  }

  /**
   * Translates a key, and returns its translated value
   * acccording to user's preferred language.
   * 
   * @param key Key to lookup
   */
  public translate(key: string) {
    return BaseComponent.translate(key);
  }

  /**
   * Invoked when user clicks the forgot password button.
   */
  public forgotPassword() {
    this.forgotPasswordClicked = true;
  }

  /**
   * Aborts the 'send new password' procedure.
   */
  public abort() {
    this.forgotPasswordClicked = false;
  }

  /**
   * Sends a reset password link to email address.
   */
  public sendResetLink() {
    this.service.sendPasswordResetLink(this.email).subscribe(res => {
      if (res.result === 'SUCCESS') {
        this.snackBar.open(
          this.translate(res.extra),
          'ok', {
            duration: 10000,
          });
          this.dialogRef.close();
          localStorage.setItem('canRequestNewPassword', 'false');
      } else {
        this.snackBar.open(
          this.translate(res.extra),
          'ok', {
            duration: 5000,
          });
      }
    }, error => console.log(error));
  }
}
