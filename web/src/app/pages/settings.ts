import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { rel, tempPassword } from '../core/util';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';
import { Avatar } from '../shared/bits';
import { SettingsWhatsapp } from './settings-whatsapp';
import { SettingsBilling } from './settings-billing';
import { SettingsSecurity } from './settings-security';

@Component({
  selector: 'k3-user-dialog', imports: FORM,
  template: `<h2 mat-dialog-title>{{ u ? 'Edit ' + u.name : 'Add team member' }}</h2>
  <mat-dialog-content>
    <mat-form-field class="full"><mat-label>Name</mat-label><input matInput [(ngModel)]="f.name"></mat-form-field>
    @if (!u) { <mat-form-field class="full"><mat-label>Email (sign-in ID)</mat-label><input matInput type="email" [(ngModel)]="f.email"></mat-form-field> }
    <mat-form-field class="full"><mat-label>Phone</mat-label><input matInput [(ngModel)]="f.phone"></mat-form-field>
    <mat-form-field class="full"><mat-label>Role</mat-label><mat-select [(ngModel)]="f.role"><mat-option value="counsellor">Counsellor — own leads, inbox & tasks</mat-option><mat-option value="admin">Admin — everything incl. settings & billing</mat-option></mat-select></mat-form-field>
    <mat-form-field class="full"><mat-label>{{ u ? 'New password (optional)' : 'Temporary password' }}</mat-label><input matInput type="text" [(ngModel)]="f.password" autocomplete="new-password"><mat-hint>At least 10 characters, letters + numbers · share it securely</mat-hint></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy()">{{ u ? 'Save' : 'Add member' }}</button></mat-dialog-actions>`,
})
export class UserDialog {
  private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  u = inject<any>(MAT_DIALOG_DATA); busy = signal(false);
  f: any = this.u ? { name: this.u.name, phone: this.u.phone || '', role: this.u.role, password: '' } : { name: '', email: '', phone: '', role: 'counsellor', password: tempPassword() };
  async save() {
    this.busy.set(true);
    try { const body = Object.assign({}, this.f); if (!body.password) delete body.password; const r = this.u ? await this.api.updateUser(this.u.id, body) : await this.api.addUser(body); this.ui.toast(this.u ? 'Saved' : `${r.name} added — share their email & temporary password`); this.ref.close(r); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-settings',
  imports: [...FORM, MatTabsModule, MatSlideToggleModule, MatChipsModule, MatTableModule, MatTooltipModule, MatMenuModule, MatProgressBarModule, Avatar, SettingsWhatsapp, SettingsBilling, SettingsSecurity],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>Settings</h1><div class="sub">{{ s.me()?.tenant?.name || s.meta().institution?.name }}</div></div></div>
    <nav mat-tab-nav-bar [tabPanel]="panel" mat-stretch-tabs="false" class="tabs-bar">
      @for (t of tabs(); track t[0]) { <a mat-tab-link [active]="cur() === t[0]" (click)="go(t[0])"><mat-icon class="sm" style="margin-right:6px">{{ t[2] }}</mat-icon>{{ t[1] }}</a> }
    </nav>
    <mat-tab-nav-panel #panel>
      @if (cur() === 'billing') { <k3-settings-billing /> }
      @else if (cur() === 'security') { <k3-settings-security /> }
      @else if (!d()) { <mat-progress-bar mode="indeterminate" /> }
      @else {
        @switch (cur()) {
          @case ('whatsapp') { <k3-settings-whatsapp [data]="d()" (changed)="d.set($event)" /> }
          @case ('sources') {
            <div class="grid g-2">
              <div class="card"><h3>Website & any form builder</h3><div class="card-sub">POST form fields (parent, phone, program, student, email…) — extra fields become custom fields.</div>
                <div class="copy-row"><div class="mono small grow break">{{ d().leadSources.websiteWebhook }}</div><button mat-icon-button (click)="ui.copy(d().leadSources.websiteWebhook, 'URL copied')"><mat-icon>content_copy</mat-icon></button></div>
                <div class="code small">&lt;form method="POST" action="{{ d().leadSources.websiteWebhook }}"&gt;
  &lt;input name="parent"&gt; &lt;input name="phone"&gt; &lt;input name="program"&gt;
  &lt;input type="hidden" name="redirect" value="https://yourschool.in/thanks"&gt;
&lt;/form&gt;</div></div>
              <div class="card"><h3>Google Ads lead forms</h3><div class="card-sub">Google Ads → Lead form → Webhook integration</div>
                <div class="copy-row"><div class="mono small grow break">{{ d().leadSources.googleWebhook }}</div><button mat-icon-button (click)="ui.copy(d().leadSources.googleWebhook, 'URL copied')"><mat-icon>content_copy</mat-icon></button></div>
                <mat-form-field class="full"><mat-label>Google webhook key</mat-label><input matInput [(ngModel)]="src.googleLeadKey" placeholder="Same key you enter in Google Ads"></mat-form-field></div>
              <div class="card"><h3>Meta (Facebook & Instagram) Lead Ads</h3><div class="card-sub">Subscribe your Page to <code>leadgen</code> on the same Meta webhook as WhatsApp</div>
                <mat-form-field class="full"><mat-label>Facebook Page ID</mat-label><input matInput [(ngModel)]="src.metaPageId"></mat-form-field>
                <mat-form-field class="full"><mat-label>Page access token</mat-label><input matInput type="password" [(ngModel)]="src.metaPageToken" [placeholder]="d().leadSources.hasPageToken ? '•••••••• saved — leave blank to keep' : 'Long-lived page token'" autocomplete="off"></mat-form-field></div>
            </div>
            <div class="row" style="justify-content:flex-end;margin-top:16px"><button mat-flat-button (click)="save({ leadSources: srcOut() }, 'Lead sources saved')" [disabled]="busy()">Save lead sources</button></div>
          }
          @case ('messaging') {
            <div class="grid g-2">
              <div class="card"><h3>Messaging</h3><div class="card-sub">Used in templates, first-touch replies and phone parsing</div>
                <mat-form-field class="full"><mat-label>Welcome template (sent to every new enquiry)</mat-label><mat-select [(ngModel)]="set.welcomeTemplate"><mat-option value="">— Don’t send —</mat-option>@for (t of approved(); track t.id) {<mat-option [value]="t.name">{{ t.name }}</mat-option>}</mat-select></mat-form-field>
                <mat-form-field class="full"><mat-label>Deadline text</mat-label><input matInput [(ngModel)]="set.deadlineText" placeholder="30 November"><mat-hint>Fills the “deadline” template variable</mat-hint></mat-form-field>
                <mat-form-field class="full"><mat-label>Application link</mat-label><input matInput [(ngModel)]="set.applyLink" placeholder="https://yourschool.in/apply"></mat-form-field>
                <mat-form-field class="full"><mat-label>Default country code</mat-label><input matInput [(ngModel)]="set.countryCode" placeholder="91"></mat-form-field>
                <div class="row trow"><div class="grow"><b>Counsellors see all leads</b><div class="small muted">Off: counsellors only see leads assigned to them</div></div><mat-slide-toggle [(ngModel)]="set.counsellorSeesAll" aria-label="Counsellors see all leads" /></div></div>
              <div class="card"><h3>Monthly ad spend</h3><div class="card-sub">Used for cost-per-lead and cost-per-admission in Reports (₹ per month)</div>
                @for (src of s.meta().sources; track src) { <mat-form-field class="full"><mat-label>{{ src }}</mat-label><span matTextPrefix>₹&nbsp;</span><input matInput type="number" min="0" [(ngModel)]="spend[src]"></mat-form-field> }</div>
            </div>
            <div class="row" style="justify-content:flex-end;margin-top:16px"><button mat-flat-button (click)="saveMessaging()" [disabled]="busy()">Save</button></div>
          }
          @case ('institution') {
            <div class="grid g-2">
              <div class="card"><h3>Institution</h3><div class="card-sub">Shown in WhatsApp templates and invoices</div>
                <mat-form-field class="full"><mat-label>Name</mat-label><input matInput [(ngModel)]="inst.name"></mat-form-field>
                <div class="grid g-2" style="gap:0 12px"><mat-form-field><mat-label>Type</mat-label><mat-select [(ngModel)]="inst.type">@for (t of types; track t) {<mat-option [value]="t">{{ t }}</mat-option>}</mat-select></mat-form-field>
                  <mat-form-field><mat-label>City</mat-label><input matInput [(ngModel)]="inst.city"></mat-form-field></div>
                <mat-form-field class="full"><mat-label>Admission session</mat-label><input matInput [(ngModel)]="inst.session" placeholder="2027–28"></mat-form-field></div>
              <div class="card"><h3>Programs / classes</h3><div class="card-sub">Type and press Enter to add · used across leads, forms and reports</div>
                <mat-form-field class="full"><mat-chip-grid #grid aria-label="Programs">
                  @for (p of programs(); track p) {<mat-chip-row (removed)="programs.set(programs().filter(x => x !== p))">{{ p }}<button matChipRemove [attr.aria-label]="'Remove ' + p"><mat-icon>cancel</mat-icon></button></mat-chip-row>}
                  <input placeholder="Add program…" [matChipInputFor]="grid" [matChipInputSeparatorKeyCodes]="sep" (matChipInputTokenEnd)="addProgram($event)"></mat-chip-grid></mat-form-field></div>
            </div>
            <div class="row" style="justify-content:flex-end;margin-top:16px"><button mat-flat-button (click)="saveInstitution()" [disabled]="busy()">Save</button></div>
          }
          @case ('team') {
            <div class="row" style="margin-bottom:12px"><div class="grow small muted">{{ team().filter(u => u.active).length }} of {{ d().institution.maxUsers }} seats used</div><button mat-flat-button (click)="editUser(null)"><mat-icon>person_add</mat-icon>Add member</button></div>
            <div class="tbl-wrap"><table mat-table [dataSource]="team()">
              <ng-container matColumnDef="u"><th mat-header-cell *matHeaderCellDef>Member</th><td mat-cell *matCellDef="let u"><div class="who"><k3-avatar [name]="u.name" [color]="u.color" /><div><div class="n">{{ u.name }}</div><div class="s">{{ u.email }}</div></div></div></td></ng-container>
              <ng-container matColumnDef="r"><th mat-header-cell *matHeaderCellDef>Role</th><td mat-cell *matCellDef="let u"><span class="pill {{ u.role === 'admin' ? 'p-blue' : 'p-grey' }}">{{ u.role === 'admin' ? 'Admin' : 'Counsellor' }}</span></td></ng-container>
              <ng-container matColumnDef="s"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let u">@if (u.active) {<span class="pill p-ok">Active</span>} @else {<span class="pill p-grey">Deactivated</span>}</td></ng-container>
              <ng-container matColumnDef="l"><th mat-header-cell *matHeaderCellDef>Last sign-in</th><td mat-cell *matCellDef="let u" class="muted nowrap">{{ rel(u.lastLoginAt) }}</td></ng-container>
              <ng-container matColumnDef="a"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let u" class="num"><button mat-icon-button [matMenuTriggerFor]="m" aria-label="Actions"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #m><button mat-menu-item (click)="editUser(u)"><mat-icon>edit</mat-icon>Edit / reset password</button><button mat-menu-item (click)="toggleUser(u)"><mat-icon>{{ u.active ? 'person_off' : 'person' }}</mat-icon>{{ u.active ? 'Deactivate' : 'Reactivate' }}</button></mat-menu></td></ng-container>
              <tr mat-header-row *matHeaderRowDef="teamCols"></tr><tr mat-row *matRowDef="let r; columns: teamCols"></tr>
            </table></div>
          }
        }
      }
    </mat-tab-nav-panel>
  </div>`,
  styles: [`.tabs-bar{margin-bottom:16px;background:transparent} h3{margin:0;font:var(--mat-sys-title-medium)}
    .copy-row{display:flex;align-items:center;gap:8px;border:1px solid var(--mat-sys-outline-variant);border-radius:12px;padding:6px 6px 6px 12px;margin:10px 0} .break{word-break:break-all}
    .trow{padding:8px 0;border-top:1px solid var(--mat-sys-outline-variant)}`],
})
export class SettingsPage {
  s = inject(Session); private api = inject(Api); ui = inject(Ui); private router = inject(Router);
  tab = input<string>(); demo = environment.demo; rel = rel; sep = [ENTER, COMMA];
  types = ['School', 'College', 'Coaching Institute', 'University', 'Pre-school', 'Skill Academy'];
  teamCols = ['u', 'r', 's', 'l', 'a'];
  d = signal<any>(null); team = signal<any[]>([]); tpls = signal<any[]>([]); busy = signal(false); programs = signal<string[]>([]);
  approved = computed(() => this.tpls().filter(t => t.status === 'Approved'));
  tabs = computed(() => {
    const all: [string, string, string][] = [['whatsapp', 'WhatsApp', 'chat'], ['sources', 'Lead sources', 'input'], ['messaging', 'Messaging & spend', 'tune'], ['institution', 'Institution', 'apartment'], ['team', 'Team', 'group'], ['security', 'Security', 'shield'], ['billing', 'Plan & billing', 'credit_card']];
    return this.s.billingLocked() ? all.filter(t => t[0] === 'billing') : all;
  });
  cur = computed(() => { const t = this.tab() || 'whatsapp'; return this.tabs().some(x => x[0] === t) ? t : this.tabs()[0][0]; });
  src: any = {}; set: any = {}; spend: Record<string, number> = {}; inst: any = {};
  constructor() { if (!this.s.billingLocked()) this.load(); }
  go(t: string) { this.router.navigate(['/settings', t]); }
  async load() {
    try {
      const [d, team, tpls] = await Promise.all([this.api.settings(), this.api.team(), this.api.templates().catch(() => [])]);
      this.apply(d); this.team.set(team); this.tpls.set(tpls);
    } catch (e) { this.ui.error(e); }
  }
  apply(d: any) {
    this.d.set(d);
    this.src = { metaPageId: d.leadSources.metaPageId, googleLeadKey: d.leadSources.googleLeadKey, metaPageToken: '' };
    this.set = { welcomeTemplate: d.settings.welcomeTemplate || '', deadlineText: d.settings.deadlineText, applyLink: d.settings.applyLink, countryCode: d.settings.countryCode, counsellorSeesAll: !!d.settings.counsellorSeesAll };
    this.spend = Object.assign({}, d.settings.spend || {});
    this.inst = { name: d.institution.name, type: d.institution.type, city: d.institution.city, session: d.institution.session };
    this.programs.set([...(d.settings.programs || [])]);
  }
  srcOut() { const o = Object.assign({}, this.src); if (!o.metaPageToken) delete o.metaPageToken; return o; }
  async save(body: any, msg: string) {
    this.busy.set(true);
    try { this.apply(await this.api.saveSettings(body)); await this.s.reloadMeta(); this.ui.toast(msg); } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  saveMessaging() { this.save({ settings: Object.assign({}, this.set, { spend: this.spend }) }, 'Messaging settings saved'); }
  saveInstitution() { this.save({ institution: this.inst, settings: { programs: this.programs() } }, 'Institution saved'); }
  addProgram(e: MatChipInputEvent) { const v = (e.value || '').trim(); if (v && !this.programs().includes(v)) this.programs.update(p => [...p, v]); e.chipInput.clear(); }
  editUser(u: any) { this.ui.open(UserDialog, u, { width: '480px' }).afterClosed().subscribe(async r => { if (r) { this.team.set(await this.api.team()); this.s.reloadMeta(); } }); }
  async toggleUser(u: any) {
    if (u.active && !(await this.ui.confirm(`Deactivate ${u.name}?`, 'They can no longer sign in. Their open leads become unassigned so you can reassign them.', 'Deactivate'))) return;
    try { await this.api.updateUser(u.id, { active: !u.active }); this.team.set(await this.api.team()); this.s.reloadMeta(); this.ui.toast(u.active ? 'Member deactivated' : 'Member reactivated'); } catch (e) { this.ui.error(e); }
  }
}
