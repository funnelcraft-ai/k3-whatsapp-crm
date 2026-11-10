import { Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { FORM } from '../shared/dialogs';
import { LeadNav } from '../shared/lead-nav';

@Component({
  selector: 'k3-new-lead', imports: FORM,
  template: `<h2 mat-dialog-title>New admission enquiry</h2>
  <mat-dialog-content>
    <div class="grid g-2" style="gap:0 12px">
      <mat-form-field appearance="outline"><mat-label>Student name</mat-label><input matInput [(ngModel)]="f.student" required placeholder="e.g. Aarav Banerjee"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Parent / guardian</mat-label><input matInput [(ngModel)]="f.parent" required placeholder="e.g. Sourav Banerjee"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>WhatsApp number</mat-label><input matInput type="tel" [(ngModel)]="f.phone" required placeholder="+91 98300 12345"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Program / class</mat-label><mat-select [(ngModel)]="f.program">@for (p of s.meta().programs; track p) {<mat-option [value]="p">{{ p }}</mat-option>}</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Lead source</mat-label><mat-select [(ngModel)]="f.source">@for (p of s.meta().sources; track p) {<mat-option [value]="p">{{ p }}</mat-option>}</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Counsellor</mat-label><mat-select [(ngModel)]="f.counsellorId">@for (c of s.meta().counsellors; track c.id) {<mat-option [value]="c.id">{{ c.name }}</mat-option>}</mat-select></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Email (optional)</mat-label><input matInput type="email" [(ngModel)]="f.email"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Area</mat-label><input matInput [(ngModel)]="f.area" placeholder="e.g. Salt Lake"></mat-form-field>
    </div>
    <div class="banner info"><mat-icon>bolt</mat-icon><div class="small">On save: the WhatsApp welcome template is sent instantly, the lead enters the <b>New enquiry</b> sequence and a first-call task is created.</div></div>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button>
    <button mat-flat-button (click)="save()" [disabled]="busy() || !f.student.trim() || !f.parent.trim() || !f.phone.trim()"><mat-icon>send</mat-icon>Save & send WhatsApp</button></mat-dialog-actions>`,
})
export class NewLeadDialog {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef); private nav = inject(LeadNav);
  busy = signal(false);
  f: any = { student: '', parent: '', phone: '', email: '', area: '', program: this.s.meta().programs?.[0], source: this.s.meta().sources?.[0], counsellorId: this.s.meta().counsellors?.[0]?.id };
  async save() {
    this.busy.set(true);
    try {
      const l = await this.api.createLead(Object.assign({}, this.f, { area: this.f.area || undefined, email: this.f.email || undefined }));
      this.ref.close(l); this.s.refreshBadges();
      this.ui.toast(`${l.student || l.parent} added · welcome message sent on WhatsApp`, 'Open', () => this.nav.open(l.id, 'whatsapp'));
    } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-import', imports: [...FORM, MatSlideToggleModule],
  template: `<h2 mat-dialog-title>Import leads</h2>
  <mat-dialog-content>
    <p class="muted" style="margin-top:0">Paste CSV or choose a file. Columns: <code>student, parent, phone, program, source</code>. Any extra columns are saved as custom fields (usable in templates).</p>
    <div class="row" style="margin-bottom:12px"><button mat-stroked-button (click)="file.click()"><mat-icon>attach_file</mat-icon>Choose .csv</button><span class="small muted">{{ fileName() }}</span>
      <input #file type="file" accept=".csv,text/csv" hidden (change)="pick($event)"></div>
    <mat-form-field appearance="outline" class="full"><mat-label>CSV</mat-label><textarea matInput rows="8" class="mono" [(ngModel)]="csv"></textarea></mat-form-field>
    <mat-slide-toggle [(ngModel)]="welcome">Send the WhatsApp welcome template to every imported lead</mat-slide-toggle>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="go()" [disabled]="busy()"><mat-icon>upload</mat-icon>Import</button></mat-dialog-actions>`,
})
export class ImportDialog {
  private s = inject(Session); private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  busy = signal(false); fileName = signal(''); welcome = true;
  csv = 'student,parent,phone,program,source\nRitika Paul,Sumana Paul,+91 98311 22334,Class 6,Event / Seminar\nAryan Mehta,Vikram Mehta,+91 90070 55667,Class 11 – Science,Google Ads';
  pick(e: Event) { const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return; this.fileName.set(f.name); f.text().then(t => this.csv = t); }
  parse() {
    const split = (line: string) => { const out: string[] = []; let cur = '', q = false; for (const ch of line) { if (ch === '"') q = !q; else if (ch === ',' && !q) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()); };
    const lines = this.csv.trim().split(/\r?\n/).filter(Boolean); if (lines.length < 2) return [];
    const head = split(lines.shift()!).map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const m = this.s.meta();
    return lines.map(l => { const c = split(l); const o: any = {}; head.forEach((h, i) => o[h] = c[i] || ''); return o; }).filter(r => (r.student || r.parent) && r.phone)
      .map(r => Object.assign(r, { source: m.sources.includes(r.source) ? r.source : (m.sources.includes('Website Form') ? 'Website Form' : m.sources[0]), parent: r.parent || 'Parent', program: r.program || m.programs[0] }));
  }
  async go() {
    const rows = this.parse(); if (!rows.length) { this.ui.toast('No valid rows found — student/parent and phone are required'); return; }
    this.busy.set(true);
    try { const r = await this.api.importLeads(rows, this.welcome); this.ui.toast(`Imported ${r.imported} leads${r.duplicates ? ` · ${r.duplicates} duplicates skipped` : ''}${r.errors?.length ? ` · ${r.errors.length} rows had errors` : ''}${this.welcome ? ' · welcome messages queued' : ''}`); this.s.refreshBadges(); this.ref.close(true); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}
