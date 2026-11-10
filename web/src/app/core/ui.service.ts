/* Snackbars, confirms and simple prompt dialogs */
import { Injectable, inject, Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'k3-confirm',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>@if (data.icon) {<mat-icon style="vertical-align:-4px;margin-right:8px">{{ data.icon }}</mat-icon>}{{ data.title }}</h2>
    <mat-dialog-content><p style="white-space:pre-line;margin:0">{{ data.message }}</p></mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancel || 'Cancel' }}</button>
      <button mat-flat-button [mat-dialog-close]="true">{{ data.ok || 'OK' }}</button>
    </mat-dialog-actions>`,
})
export class ConfirmDialog { data = inject<any>(MAT_DIALOG_DATA); }

@Injectable({ providedIn: 'root' })
export class Ui {
  private snack = inject(MatSnackBar); private dialog = inject(MatDialog);
  toast(message: string, action?: string, fn?: () => void, duration = 5000) {
    const r = this.snack.open(message, action, { duration, panelClass: 'snack-wrap' });
    if (fn) r.onAction().subscribe(fn);
  }
  error(e: any) { this.toast(e?.message || String(e), 'Close', undefined, 7000); }
  confirm(title: string, message: string, ok = 'OK', icon?: string): Promise<boolean> {
    return new Promise(res => this.dialog.open(ConfirmDialog, { data: { title, message, ok, icon }, width: '440px' }).afterClosed().subscribe(v => res(!!v)));
  }
  /* open server-rendered HTML (invoices) in a new tab */
  openHtml(html: string) { const w = window.open(URL.createObjectURL(new Blob([html], { type: 'text/html' })), '_blank'); if (!w) this.toast('Allow pop-ups to view the invoice'); }
  download(blob: Blob, name: string) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  copy(text: string, what = 'Copied') { navigator.clipboard?.writeText(text).then(() => this.toast(what + ' to clipboard'), () => this.toast(text)); }
  open<T>(cmp: any, data?: any, opts: any = {}) { return this.dialog.open<T>(cmp, Object.assign({ data, width: '560px', maxWidth: '96vw', autoFocus: 'first-tabbable' }, opts)); }
}
