import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Api } from '../core/api.service';
import { Ui } from '../core/ui.service';
import { Session } from '../core/session.service';
import { FORM } from '../shared/dialogs';

@Component({
  selector: 'k3-password', imports: FORM,
  template: `<h2 mat-dialog-title>Change password</h2>
  <mat-dialog-content>
    <mat-form-field appearance="outline" class="full"><mat-label>Current password</mat-label><input matInput type="password" [(ngModel)]="cur" autocomplete="current-password"></mat-form-field>
    <mat-form-field appearance="outline" class="full"><mat-label>New password</mat-label><input matInput type="password" [(ngModel)]="next" autocomplete="new-password"><mat-hint>At least 10 characters, with letters and numbers</mat-hint></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy() || next.length < 10 || !cur">Update</button></mat-dialog-actions>`,
})
export class PasswordDialog {
  private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef); private s = inject(Session);
  cur = ''; next = ''; busy = signal(false);
  async save() { this.busy.set(true); try { const r = await this.api.changePassword(this.cur, this.next); if (r?.token) this.s.setToken(r.token); this.ui.toast('Password updated — other devices were signed out'); this.ref.close(); } catch (e) { this.ui.error(e); } this.busy.set(false); }
}
