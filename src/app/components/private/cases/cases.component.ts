/*
 * AnarQ, a Direct Democracy system. Copyright 2020 - Thomas Hansen thomas@servergardens.com
 */

import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material';
import { MatPaginator } from '@angular/material';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

import { CaseService } from 'src/app/services/http/case.service';
import { EditCasesComponent } from './modals/edit.cases.component';

/*
 * "Datagrid" component for displaying instance of Cases
 * entities from your HTTP REST backend.
 */
@Component({
  selector: 'app-cases',
  templateUrl: './cases.component.html',
  styleUrls: ['./cases.component.scss']
})
export class CasesComponent implements OnInit {

  // Actual data currently displayed in the grid. The mat-table will be databound to this list.
  data: any[];

  // Which columns we should display. Reorder to prioritize columns differently.
  // Notice! 'delete-instance' should always come last!
  displayedColumns: string[] = ['type', 'region', 'subject', 'created', 'delete-instance'];

  // Current filter being applied to filter items from our backend.
  filter: any = {
    limit: 10,
    order: 'created',
    direction: 'asc',
    type: 'new',
  };

  // Number of items our backend reports are available in total, matching our above filter condition.
  count = 0;
  hasFiltered = true;

  // Number of milliseconds after a keystroke before filtering should be re-applied.
  debounce = 400;

  // List of items we're currently viewing details for.
  viewDetails: any[] = [];

  // Need to view paginator as a child to update page index of it.
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

  /*
   * This is needed to figure out whether or not user has access to
   * delete, create and update methods.
   */
  roles: string [] = [];

  // Form control declarations to bind up with reactive form elements.
  type: FormControl;
  region: FormControl;
  created: FormControl;
  deadline: FormControl;
  subject: FormControl;
  body: FormControl;


  // Constructor taking a bunch of services/helpers through dependency injection.
  constructor(
    private httpService: CaseService,
    private jwtHelper: JwtHelperService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) {

      // Checking if user is logged in, at which point we initialize the roles property.
      const token = localStorage.getItem('jwt_token');
      if (token !== null && token !== undefined) {

        // Yup! User is logged in!
        this.roles = this.jwtHelper.decodeToken(token).role;
      }
    }

  // OnInit implementation. Retrieves initial data (unfiltered) and instantiates our FormControls.
  ngOnInit() {

    // Retrieves data from our backend, unfiltered, and binds our mat-table accordingly.
    this.getData();

    // Necessary to make sure we can have "live filtering" in our datagrid.
    this.type = new FormControl('');
    this.type.setValue('new');
    this.type.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['type'] = this.type.value;
        this.getData();
      });
    this.region = new FormControl('');
    this.region.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['region.like'] = this.region.value + '%';
        this.getData();
      });
    this.created = new FormControl('');
    this.created.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['created.eq'] = this.created.value;
        this.getData();
      });
    this.deadline = new FormControl('');
    this.deadline.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['deadline.eq'] = this.deadline.value;
        this.getData();
      });
    this.subject = new FormControl('');
    this.subject.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['subject.like'] = this.subject.value + '%';
        this.getData();
      });
    this.body = new FormControl('');
    this.body.valueChanges
      .pipe(debounceTime(this.debounce), distinctUntilChanged())
      .subscribe(query => {
        this.paginator.pageIndex = 0;
        this.filter.offset = 0;
        this.hasFiltered = true;
        this.filter['body.like'] = this.body.value + '%';
        this.getData();
      });
  }

  /*
   * Returns the class for the header row, which will only be visible
   * if there are more than 20 records in dataset, before filtering has been applied.
   */
  getHeaderRowClass() {
    if (this.showPager()) {
      return 'show-pager';
    }
    return 'hide-pager';
  }

  /*
   * Returns true if the pager should be shown.
   */
  showPager() {
    if (this.hasFiltered || this.count > 10) {
      return true;
    }
    return false;
  }

  // Method that retrieves data from backend according to specified filter.
  getData(countRecords: boolean = true) {

    // Resetting view details, to avoid "hanging objects". Notice, will close all "view details" items in grid.
    this.viewDetails = [];

    // Retrieves items from our backend through our HTTP service layer.
    this.httpService.getCases(this.filter).subscribe(res => {
      this.data = res;

      // Checking if user wants to (re)-count items, and if so, invoking "count records" HTTP service method.
      if (countRecords) {

        // Notice, we need to clone all filter arguments, except limit, offset, order and direction.
        const cloned = {};
        for (const idx in this.filter) {
          if (Object.prototype.hasOwnProperty.call(this.filter, idx)) {
            switch (idx) {
              case 'limit':
              case 'offset':
              case 'order':
              case 'direction':
                break; // Ignoring
              default:
                cloned[idx] = this.filter[idx];
                break;
            }
          }
        }

        // Invoking "count records" HTTP service layer method.
        this.httpService.countCases(cloned).subscribe(res2 => {
          this.count = res2.count;
        }, error => {

          // Oops, error when invoking count method.
          console.error(error);
          this.error(error.error.message);
        });
      }
    }, error => {

      // Oops, error when invoking get items method.
      console.error(error);
      this.error(error.error.message);
    });
  }

  // Sorts by the specified column.
  sort(column: string) {
    if (this.filter.order === column) {

      // Inverting sort direction.
      this.filter.direction =
        this.filter.direction === 'asc' ||
        this.filter.direction === null ||
        this.filter.direction === undefined ?
          'desc' :
          'asc';
    } else {
      this.filter.order = column;
      this.filter.direction = 'asc';
    }
    this.paginator.pageIndex = 0;
    this.filter.offset = 0;
    this.getData(false);
  }

  getSortIcon(column: string) {
    if (this.filter.order !== column) {
      return 'sort_by_alpha';
    }
    if (this.filter.direction === 'asc') {
      return 'keyboard_arrow_down';
    } else {
      return 'keyboard_arrow_up';
    }
  }

  // Shows or hides the "view details" row for a specific record.
  toggleDetails(entity: any) {
    const indexOf = this.viewDetails.indexOf(entity);
    if (indexOf === -1) {
      this.viewDetails.push(entity);
    } else {
      this.viewDetails.splice(indexOf, 1);
    }
  }

  // Returns true if details should be displayed for a specific database record.
  shouldDisplayDetails(entity: any) {
    if (this.viewDetails.indexOf(entity) !== -1) {
      return true;
    }
    return false;
  }

  /*
   * Returns CSS class name for a specific table row (tr element).
   * Notice, the CSS class is changed according to whether or not the details
   * window is visible or not.
   */
  getClassForRecord(entity: any) {
    let result = 'grid-row';
    if (this.viewDetails.indexOf(entity) !== -1) {
      result += ' visible-details';
    }
    if (entity.type === 'rejected') {
      result += ' rejected';
    }
    else if (entity.type === 'open') {
      result += ' open';
    } else {
      result += ' undetermined';
    }
    return result;
  }

  /*
   * Returns the CSS class for the "view details" parts.
   * Notice, this basically ensures that the "view details" is invisible unless
   * explicitly shown by the user choosing to view the details for a record.
   */
  getClassForDetails(entity: any) {
    if (this.viewDetails.indexOf(entity) !== -1) {
      return 'details-row visible';
    }
    return 'details-row hidden';
  }

  /*
   * Invoked when user wants to edit an entity
   * This will show a modal dialog, allowing the user to edit his record.
   */
  acceptCase(entity: any) {

    /*
     * Cloning our entity, in case user doesn't click the "Save" button,
     * to avoid changing main databound entity.
     */
    const data = {
      isEdit: true,
      isAccept: true,
      entity: {},
    };
    for (const idx in entity) {
      if (Object.prototype.hasOwnProperty.call(entity, idx)) {
        data.entity[idx] = entity[idx];
      }
    }

    // Creating our modal dialog, passing in the cloned entity, and "isEdit" as true.
    const dialogRef = this.dialog.open(EditCasesComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res !== null && res !== undefined) {

        // User clicked "Save" button, making sure we update databound grid item according to the new value(s).
        for (const idx in res) {
          if (Object.prototype.hasOwnProperty.call(res, idx)) {
            entity[idx] = res[idx];
          }
        }

        // Showing a little information window, giving the user feedback about that editing was successful.
        this.snackBar.open('Cases item successfully updated', 'Close', {
          duration: 2000,
        });
      }
    });
  }

  rejectCase(input: any) {
    this.httpService.rejectCase(input.id).subscribe(res => {
      this.getData(true);
    });
  }

  // Creates a new data record, by showing the modal edit/create dialog.
  createNewRecord() {

    // Parametrizing our modal dialog correctly. Notice "idEdit" being false.
    const data = {
      isEdit: false,
      isAccept: false,
      entity: {},
    };

    // Opening our dialog.
    const dialogRef = this.dialog.open(EditCasesComponent, {
      data
    });
    dialogRef.afterClosed().subscribe(res => {
      if (res !== null && res !== undefined) {

        // Notice, at this point, the item is already saved. Hence, re-retrieving data from backend.
        this.getData();
        this.snackBar.open('Cases item successfully created', 'Close', {
          duration: 2000,
        });
      }
    });
  }

  allowEdit(entity: any) {
    return entity.type === 'new';
  }

  // Invoked when an entity is deleted. Invokes HTTP service that deletes item from backend.
  delete(entity: any, ids: any) {

    // Making sure we actually have a primary key, and if not, preventing deletion.
    let hasKeys = false;
    for (const idx in ids) {
      if (ids.hasOwnProperty(idx)) {
        hasKeys = true;
        break;
      }
    }
    if (!hasKeys) {
      this.error('Your endpoint does not accept any primary keys, and hence deletion of individual entities becomes impossible');
      return;
    }

    // Invoking HTTP service DELETE method.
    this.httpService.deleteCases(ids).subscribe(res => {

      // Sanity checking invocation.
      if (res['deleted-records'] !== 1) {
        this.error(`For some reasons ${res['deleted-records']} records was deleted, and not 1 as expected!`);
      }

      // Making sure we remove "view details" for item, if item is currently being viewed.
      const indexOf = this.viewDetails.indexOf(entity);
      if (indexOf !== -1) {
        this.viewDetails.splice(indexOf, 1);
      }

      // Re-retrieving data from backend, according to filter (we're down one record now according to our pager).
      this.getData();
    }, error => {

      // Oops, error when attempting to delete item.
      console.error(error);
      this.error(error.error.message);
    });
  }

  // Invoked when pager is paged.
  paged(e: PageEvent) {
    this.viewDetails = [];
    if (this.filter.limit !== e.pageSize) {
      this.filter.limit = e.pageSize;
      this.paginator.pageIndex = 0;
      this.filter.offset = 0;
    } else {
      this.filter.offset = e.pageIndex * e.pageSize;
    }
    this.getData(false);
  }

  // Returns true if user belongs to (at least) one of the specified roles.
  inRole(roles: string[]) {
    for (const idx of roles) {
      if (this.roles.indexOf(idx) !== -1) {
        return true;
      }
    }
    return false;
  }

  // Helper method to display an error to user in a friendly SnackBar type of widget.
  error(error: string) {
    this.snackBar.open(error, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
