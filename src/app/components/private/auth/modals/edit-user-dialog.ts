/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar, MatSelectChange } from '@angular/material';
import { UsersService } from 'src/app/services/http/users.service';

export interface DialogData {
  username: string;
}

@Component({
  templateUrl: 'edit-user-dialog.html',
  styleUrls: ['edit-user-dialog.scss']
})
export class EditUserDialogComponent implements OnInit {

  public userRoles: any[] = null;
  public allRoles: any[] = null;
  public selectedValue: any = null;

  constructor(
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackBar: MatSnackBar,
    private authService: UsersService) { }

  ngOnInit() {
    this.getUserRoles();
    this.authService.getRoles({
      limit: 1000,
      offset: 0,
    }).subscribe(res => {
      this.allRoles = res;
    }, error => {
      this.snackBar.open(error.error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    });
  }

  getUserRoles() {
    this.authService.getUserRoles(this.data.username).subscribe(res => {
      this.userRoles = res || [];
    }, error => {
      this.snackBar.open(error.error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    });
  }

  addRole(e: MatSelectChange) {
    this.authService.addRoleToUser(this.data.username, e.value.name).subscribe(res => {
      this.snackBar.open('Role added to user', 'Close', {
        duration: 2000,
      });
      this.selectedValue = undefined;
      this.getUserRoles();
    }, error => {
      this.snackBar.open(error.error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
      this.selectedValue = undefined;
    });
  }

  deleteRoleFromUser(role: string) {
    this.authService.deleteRoleFromUser(this.data.username, role).subscribe(res => {
      this.snackBar.open('Role removed from user', 'Close', {
        duration: 2000,
      });
      this.getUserRoles();
    }, error => {
      this.snackBar.open(error.error.message, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar'],
      });
    });
  }
  
  close() {
    this.dialogRef.close();
  }
}
