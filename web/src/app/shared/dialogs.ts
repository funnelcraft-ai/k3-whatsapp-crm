/* Reusable form dialogs */
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { FU_TYPE } from '../core/util';

export const FORM = [FormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule];
const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16);

/* pick a single value from a list: data {title, icon, label, options:[{value,label}], ok, note} */
@Component({
  selector: 'k3-pick', imports: FORM,
  template: `<h2 mat-dialog-title>{{ d.title }}</h2>
  <mat-dialog-content>
    <mat-form-field appearance="outline" class="full"><mat-label>{{ d.label }}</mat-label>
      <mat-select [(ngModel)]="value">@for (o of d.options; track o.value) {<mat-option [value]="o.value">{{ o.label }}</mat-option>}</mat-select></mat-form-field>
    @if (d.note) {<p class="muted small" style="margin:0">{{ d.note }}</p>}
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [mat-dialog-close]="value" [disabled]="!value">{{ d.ok || 'OK' }}</button></mat-dialog-actions>`,
})
export class PickDialog { d = inject<any>(MAT_DIALOG_DATA); value = this.d.value ?? this.d.options[0]?.value; }

/* schedule a follow-up for one lead or any lead */
@Component({
  selector: 'k3-followup', imports: FORM,
  template: `<h2 mat-dialog-title>{{ lead ? 'Follow-up · ' + lead.parent : 'Add follow-up' }}</h2>
  <mat-dialog-content>
    @if (!lead) {
      <mat-form-field appearance="outline" class="full"><mat-label>Lead</mat-label>
        <mat-select [(ngModel)]="leadId">@for (l of leads(); track l.id) {<mat-option [value]="l.id">{{ l.student }} — {{ l.parent }} ({{ l.program }})</mat-option>}</mat-select></mat-form-field>
    }
    <div class="grid g-2" style="gap:0 12px">
      <mat-form-field appearance="outline"><mat-label>Type</mat-label>
        <mat-select [(ngModel)]="type">@for (t of types; track t[0]) {<mat-option [value]="t[0]">{{ t[1].label }}</mat-option>}</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Due</mat-label><input matInput type="datetime-local" [(ngModel)]="due"></mat-form-field>
    </div>
    <mat-form-field appearance="outline" class="full"><mat-label>Note</mat-label><input matInput [(ngModel)]="note" placeholder="e.g. Discuss transport & fee instalments"></mat-form-field>
    <mat-form-field appearance="outline" class="full"><mat-label>Owner</mat-label>
      <mat-select [(ngModel)]="owner">@for (c of s.meta().counsellors; track c.id) {<mat-option [value]="c.id">{{ c.name }}</mat-option>}</mat-select></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy() || !(lead || leadId)">Schedule</button></mat-dialog-actions>`,
})
export class FollowupDialog {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  lead = inject<any>(MAT_DIALOG_DATA)?.lead; leads = signal<any[]>([]); busy = signal(false);
  types = Object.entries(FU_TYPE); type = 'call'; note = ''; leadId = '';
  owner = this.lead?.counsellorId || this.s.meta().counsellors?.[0]?.id;
  due = (() => { const d = new Date(Date.now() + 2 * 36e5); d.setMinutes(0); return localInput(d); })();
  constructor() { if (!this.lead) this.api.leads().then(ls => { const open = ls.filter(l => !['admitted', 'lost'].includes(l.stage)); this.leads.set(open); this.leadId = open[0]?.id || ''; }); }
  async save() {
    this.busy.set(true);
    try {
      const f = await this.api.createFollowup({ leadId: this.lead ? this.lead.id : this.leadId, type: this.type, due: new Date(this.due).toISOString(), note: this.note || FU_TYPE[this.type].label + ' follow-up', owner: this.owner });
      this.ui.toast('Follow-up scheduled'); this.s.refreshBadges(); this.ref.close(f);
    } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

/* key/value custom fields editor */
@Component({
  selector: 'k3-custom-fields', imports: FORM,
  template: `<h2 mat-dialog-title>Custom fields</h2>
  <mat-dialog-content>
    <p class="small muted" style="margin-top:0">Map these to template variables in Templates → Variables (e.g. &#123;&#123;2&#125;&#125; = roll_no). CSV imports and website forms fill them automatically from extra columns.</p>
    @for (r of rows; track $index) {
      <div class="row">
        <mat-form-field appearance="outline" style="flex:1" subscriptSizing="dynamic"><mat-label>Field</mat-label><input matInput [(ngModel)]="r.k" placeholder="roll_no"></mat-form-field>
        <mat-form-field appearance="outline" style="flex:1.4" subscriptSizing="dynamic"><mat-label>Value</mat-label><input matInput [(ngModel)]="r.v"></mat-form-field>
        <button mat-icon-button (click)="rows.splice($index, 1)" aria-label="Remove"><mat-icon>delete</mat-icon></button>
      </div>
    }
    <button mat-button (click)="rows.push({ k: '', v: '' })" style="margin-top:8px"><mat-icon>add</mat-icon>Add field</button>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="done()">Save</button></mat-dialog-actions>`,
})
export class CustomFieldsDialog {
  private ref = inject(MatDialogRef); rows: { k: string; v: string }[] = Object.entries(inject<any>(MAT_DIALOG_DATA).custom || {}).map(([k, v]) => ({ k, v: String(v) }));
  constructor() { if (!this.rows.length) this.rows.push({ k: '', v: '' }); }
  done() { const o: any = {}; for (const r of this.rows) if (r.k.trim() && r.v.trim()) o[r.k.trim()] = r.v.trim(); this.ref.close(o); }
}

/* call + outcome logger */
@Component({
  selector: 'k3-call', imports: FORM,
  template: `<h2 mat-dialog-title>Call {{ l.parent }}</h2>
  <mat-dialog-content>
    <p style="font:var(--mat-sys-headline-small);margin:4px 0 12px" class="tnum"><a [href]="'tel:' + l.phone.replace(/\\s/g, '')">{{ l.phone }}</a></p>
    <p class="muted small">Tap the number to call from your phone. After the call, log the outcome:</p>
    <mat-form-field appearance="outline" class="full"><mat-label>Outcome</mat-label>
      <mat-select [(ngModel)]="o">@for (x of outcomes; track x) {<mat-option [value]="x">{{ x }}</mat-option>}</mat-select></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [mat-dialog-close]="o">Log call</button></mat-dialog-actions>`,
})
export class CallDialog { l = inject<any>(MAT_DIALOG_DATA); outcomes = ['Connected — interested', 'Connected — needs time', 'Visit booked', 'No answer', 'Not interested']; o = this.outcomes[0]; }
