/* K3 platform owner console: institutions, plans & pricing, payments, backups, company keys, admins */
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { fmtDate, num, rel, rupees, tempPassword } from '../core/util';
import { FORM } from '../shared/dialogs';
import { Kpi } from '../shared/bits';
import { SettingsSecurity } from './settings-security';

@Component({
  selector: 'k3-tenant-dialog', imports: [...FORM, MatSlideToggleModule],
  template: `<h2 mat-dialog-title>{{ t ? 'Edit ' + t.name : 'New institution' }}</h2>
  <mat-dialog-content>
    <mat-form-field class="full"><mat-label>Institution name</mat-label><input matInput [(ngModel)]="f.name"></mat-form-field>
    @if (!t) {
      <div class="grid g-2" style="gap:0 12px">
        <mat-form-field><mat-label>Type</mat-label><mat-select [(ngModel)]="f.type">@for (x of types; track x) {<mat-option [value]="x">{{ x }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field><mat-label>City</mat-label><input matInput [(ngModel)]="f.city"></mat-form-field>
        <mat-form-field><mat-label>Admin name</mat-label><input matInput [(ngModel)]="f.admin.name"></mat-form-field>
        <mat-form-field><mat-label>Admin email (sign-in ID)</mat-label><input matInput type="email" [(ngModel)]="f.admin.email"></mat-form-field>
      </div>
      <mat-form-field class="full"><mat-label>Temporary admin password</mat-label><input matInput [(ngModel)]="f.admin.password"><mat-hint>10+ characters with letters and numbers — they can change it after signing in</mat-hint></mat-form-field>
      <mat-form-field class="full"><mat-label>Free trial (days)</mat-label><input matInput type="number" min="0" [(ngModel)]="f.trialDays"><mat-hint>0 = no trial; you manage access manually or they subscribe via Razorpay</mat-hint></mat-form-field>
    } @else {
      <mat-form-field class="full"><mat-label>Plan label</mat-label><input matInput [(ngModel)]="f.plan"></mat-form-field>
      <mat-form-field class="full"><mat-label>Access until (blank = no expiry)</mat-label><input matInput type="date" [(ngModel)]="f.planExpiresAt"></mat-form-field>
    }
    <div class="grid g-2" style="gap:0 12px">
      <mat-form-field><mat-label>Max users</mat-label><input matInput type="number" min="1" [(ngModel)]="f.maxUsers"></mat-form-field>
      <mat-form-field><mat-label>Max contacts</mat-label><input matInput type="number" min="100" [(ngModel)]="f.maxContacts"></mat-form-field>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy()">{{ t ? 'Save' : 'Create institution' }}</button></mat-dialog-actions>`,
})
export class TenantDialog {
  private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  t = inject<any>(MAT_DIALOG_DATA); busy = signal(false); types = ['School', 'College', 'Coaching Institute', 'University', 'Pre-school', 'Skill Academy'];
  f: any = this.t ? { name: this.t.name, plan: this.t.plan, planExpiresAt: this.t.planExpiresAt ? this.t.planExpiresAt.slice(0, 10) : '', maxUsers: this.t.maxUsers, maxContacts: this.t.maxContacts }
    : { name: '', type: 'School', city: '', admin: { name: '', email: '', password: tempPassword() }, trialDays: 14, maxUsers: 5, maxContacts: 5000 };
  async save() {
    this.busy.set(true);
    try {
      if (this.t) await this.api.updateTenant(this.t.id, Object.assign({}, this.f, { planExpiresAt: this.f.planExpiresAt ? new Date(this.f.planExpiresAt + 'T23:59:59').toISOString() : null }));
      else { await this.api.createTenant(this.f); await this.ui.confirm('Institution created', `Share these sign-in details with ${this.f.name}:\n\nEmail: ${this.f.admin.email}\nPassword: ${this.f.admin.password}`, 'Done', 'domain_add'); }
      this.ref.close(true);
    } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-plan-dialog', imports: [...FORM, MatSlideToggleModule],
  template: `<h2 mat-dialog-title>{{ p ? 'Edit plan' : 'New plan' }}</h2>
  <mat-dialog-content>
    <mat-form-field class="full"><mat-label>Name</mat-label><input matInput [(ngModel)]="f.name" placeholder="Growth (monthly)"></mat-form-field>
    <mat-form-field class="full"><mat-label>Description</mat-label><input matInput [(ngModel)]="f.description"></mat-form-field>
    <div class="grid g-3" style="gap:0 12px">
      <mat-form-field><mat-label>Billing</mat-label><mat-select [(ngModel)]="f.billing"><mat-option value="monthly">Monthly</mat-option><mat-option value="yearly">Yearly</mat-option><mat-option value="one_time">One-time licence</mat-option></mat-select></mat-form-field>
      <mat-form-field><mat-label>Price (₹, before GST)</mat-label><input matInput type="number" min="1" [(ngModel)]="rupees"></mat-form-field>
      <mat-form-field><mat-label>GST %</mat-label><input matInput type="number" min="0" [(ngModel)]="f.gstPercent"></mat-form-field>
      <mat-form-field><mat-label>Max users</mat-label><input matInput type="number" [(ngModel)]="f.maxUsers"></mat-form-field>
      <mat-form-field><mat-label>Max contacts</mat-label><input matInput type="number" [(ngModel)]="f.maxContacts"></mat-form-field>
      <mat-form-field><mat-label>Sort order</mat-label><input matInput type="number" [(ngModel)]="f.sort"></mat-form-field>
    </div>
    <mat-form-field class="full"><mat-label>Features (one per line)</mat-label><textarea matInput rows="4" [(ngModel)]="features"></textarea></mat-form-field>
    <mat-slide-toggle [(ngModel)]="f.active">Visible to institutions</mat-slide-toggle>
    @if (p) {<p class="small muted">Changing price or billing creates a new Razorpay plan for new subscribers; existing subscriptions keep their price.</p>}
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy() || !f.name || !rupees">Save plan</button></mat-dialog-actions>`,
})
export class PlanDialog {
  private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  p = inject<any>(MAT_DIALOG_DATA); busy = signal(false);
  f: any = Object.assign({ name: '', description: '', billing: 'monthly', gstPercent: 18, maxUsers: 5, maxContacts: 5000, sort: 10, active: true }, this.p || {});
  rupees = this.p ? this.p.pricePaise / 100 : 2999; features = (this.p?.features || []).join('\n');
  async save() {
    this.busy.set(true);
    const body = Object.assign({}, this.f, { pricePaise: Math.round(+this.rupees * 100), features: this.features.split('\n').map((x: string) => x.trim()).filter(Boolean) });
    try { this.p ? await this.api.updatePlan(this.p.id, body) : await this.api.createPlan(body); this.ui.toast('Plan saved'); this.ref.close(true); } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-support-dialog', imports: FORM,
  template: `<h2 mat-dialog-title><mat-icon style="vertical-align:-4px;margin-right:8px">support_agent</mat-icon>Start support session</h2>
  <mat-dialog-content>
    <p class="small muted" style="margin-top:0">You will act as <b>{{ d.name }}</b>'s admin for up to 2 hours. The school can see this session, the reason you give, and every change you make in it.</p>
    <mat-form-field appearance="outline" class="full"><mat-label>Why are you opening this school?</mat-label><input matInput [(ngModel)]="reason" maxlength="200" placeholder="e.g. Help fix lead import"></mat-form-field>
    <mat-form-field appearance="outline" class="full"><mat-label>Access</mat-label>
      <mat-select [(ngModel)]="readOnly"><mat-option [value]="true">Read-only — look but don't change anything (recommended)</mat-option><mat-option [value]="false">Full access — can change data</mat-option></mat-select></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [mat-dialog-close]="{ reason: reason.trim(), readOnly }" [disabled]="reason.trim().length < 3">Start session</button></mat-dialog-actions>`,
})
export class SupportDialog { d = inject<any>(MAT_DIALOG_DATA); reason = ''; readOnly = true; }

@Component({
  selector: 'k3-platform',
  imports: [...FORM, MatTableModule, MatMenuModule, MatTooltipModule, MatSlideToggleModule, MatProgressBarModule, Kpi, SettingsSecurity],
  template: `
  <div class="page">
    @switch (cur()) {
      @case ('institutions') {
        <div class="page-head"><div><h1>Institutions</h1><div class="sub">Every school, college and coaching centre on your K3 platform</div></div><div class="grow"></div>
          <button mat-stroked-button (click)="demo()" [disabled]="busy()"><mat-icon>science</mat-icon>Create demo school</button>
          <button mat-flat-button (click)="editTenant(null)"><mat-icon>domain_add</mat-icon>New institution</button></div>
        <div class="banner info"><mat-icon>info</mat-icon><div class="small">This is the <b>platform owner console</b>. The CRM itself (leads, inbox, broadcasts…) lives inside each institution — use <b>Open</b> to enter one as its admin (support session), or <b>Create demo school</b> for a fully-populated sales demo.</div></div>
        <div class="kpis">
          <k3-kpi icon="domain" label="Institutions" [value]="num(tenants().length)" [delta]="active() + ' active'" />
          <k3-kpi icon="paid" label="Paying" [value]="num(paying())" [delta]="trials() + ' on trial'" />
          <k3-kpi icon="groups" label="Leads managed" [value]="num(sum('leads'))" delta="across all institutions" />
          <k3-kpi icon="send" label="Messages this month" [value]="num(sum('messagesThisMonth'))" delta="outbound WhatsApp" />
        </div>
        @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
        <div class="tbl-wrap"><table mat-table [dataSource]="tenants()">
          <ng-container matColumnDef="n"><th mat-header-cell *matHeaderCellDef>Institution</th><td mat-cell *matCellDef="let t"><div class="n">{{ t.name }}</div><div class="small muted">{{ t.type }}@if (t.city) { · {{ t.city }}} · {{ t.adminEmail }}</div></td></ng-container>
          <ng-container matColumnDef="p"><th mat-header-cell *matHeaderCellDef>Plan</th><td mat-cell *matCellDef="let t" class="nowrap">{{ t.plan }}<div class="small"><span class="pill {{ bill(t)[1] }}">{{ bill(t)[0] }}</span></div></td></ng-container>
          <ng-container matColumnDef="x"><th mat-header-cell *matHeaderCellDef>Access until</th><td mat-cell *matCellDef="let t" class="nowrap" [class.over]="t.planExpiresAt && isPast(t.planExpiresAt)">{{ t.planExpiresAt ? d(t.planExpiresAt) : '—' }}</td></ng-container>
          <ng-container matColumnDef="u"><th mat-header-cell *matHeaderCellDef class="num">Users</th><td mat-cell *matCellDef="let t" class="num">{{ t.users }}/{{ t.maxUsers }}</td></ng-container>
          <ng-container matColumnDef="l"><th mat-header-cell *matHeaderCellDef class="num">Leads</th><td mat-cell *matCellDef="let t" class="num">{{ num(t.leads) }}</td></ng-container>
          <ng-container matColumnDef="m"><th mat-header-cell *matHeaderCellDef class="num">Msgs / mo</th><td mat-cell *matCellDef="let t" class="num">{{ num(t.messagesThisMonth) }}</td></ng-container>
          <ng-container matColumnDef="w"><th mat-header-cell *matHeaderCellDef>WhatsApp</th><td mat-cell *matCellDef="let t">@if (t.whatsappConnected) {<span class="pill p-ok">Connected</span>} @else {<span class="pill p-grey">Not set</span>}</td></ng-container>
          <ng-container matColumnDef="s"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let t">@if (t.status === 'active') {<span class="pill p-ok">Active</span>} @else {<span class="pill p-bad">Suspended</span>}</td></ng-container>
          <ng-container matColumnDef="a"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let t" class="nowrap num">
            <button mat-button (click)="open(t)"><mat-icon>login</mat-icon>Open</button>
            <button mat-icon-button [matMenuTriggerFor]="m" aria-label="More"><mat-icon>more_vert</mat-icon></button>
            <mat-menu #m><button mat-menu-item (click)="editTenant(t)"><mat-icon>edit</mat-icon>Edit plan & limits</button>
              <button mat-menu-item (click)="toggleTenant(t)"><mat-icon>{{ t.status === 'active' ? 'block' : 'check_circle' }}</mat-icon>{{ t.status === 'active' ? 'Suspend' : 'Re-activate' }}</button></mat-menu></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="tCols"></tr><tr mat-row *matRowDef="let r; columns: tCols"></tr>
        </table></div>
      }
      @case ('plans') {
        <div class="page-head"><div><h1>Plans & pricing</h1><div class="sub">What institutions see under Settings → Plan & billing. Prices exclude GST.</div></div><div class="grow"></div><button mat-flat-button (click)="editPlan(null)"><mat-icon>add</mat-icon>New plan</button></div>
        @if (!company()?.razorpay?.enabled) { <div class="banner warn"><mat-icon>warning</mat-icon><div class="small">Razorpay keys are not configured — institutions can see plans but cannot pay online. Add <code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code> and <code>RAZORPAY_WEBHOOK_SECRET</code> to the server environment.</div></div> }
        <div class="plans">
          @for (p of plans(); track p.id) {
            <div class="plan-card" [style.opacity]="p.active ? 1 : .55">
              <div class="row"><b class="grow">{{ p.name }}</b><span class="pill {{ p.active ? 'p-ok' : 'p-grey' }}">{{ p.active ? 'Visible' : 'Hidden' }}</span></div>
              <div class="price">{{ money(p.pricePaise) }}<span class="small muted"> {{ p.billing === 'one_time' ? 'one-time' : '/' + (p.billing === 'monthly' ? 'month' : 'year') }}</span></div>
              <div class="small muted">+{{ p.gstPercent }}% GST = {{ money(p.totalPaise) }} · {{ p.maxUsers }} users · {{ num(p.maxContacts) }} contacts</div>
              <ul>@for (f of p.features || []; track f) {<li>{{ f }}</li>}</ul>
              <span class="grow"></span><button mat-stroked-button (click)="editPlan(p)"><mat-icon>edit</mat-icon>Edit</button>
            </div>
          }
        </div>
      }
      @case ('payments') {
        <div class="page-head"><div><h1>Payments</h1><div class="sub">Razorpay payments & GST invoices across all institutions</div></div></div>
        <div class="kpis"><k3-kpi icon="currency_rupee" label="Collected (all time)" [value]="money(collected())" [delta]="payments().length + ' payments'" /><k3-kpi icon="calendar_month" label="This month" [value]="money(thisMonth())" delta="incl. GST" /></div>
        <div class="tbl-wrap"><table mat-table [dataSource]="payments()">
          <ng-container matColumnDef="i"><th mat-header-cell *matHeaderCellDef>Invoice</th><td mat-cell *matCellDef="let p" class="nowrap">{{ p.invoiceNo || '—' }}</td></ng-container>
          <ng-container matColumnDef="t"><th mat-header-cell *matHeaderCellDef>Institution</th><td mat-cell *matCellDef="let p">{{ p.tenantName }}<div class="small muted">{{ p.description }}</div></td></ng-container>
          <ng-container matColumnDef="d"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let p" class="nowrap">{{ d(p.createdAt) }}</td></ng-container>
          <ng-container matColumnDef="a"><th mat-header-cell *matHeaderCellDef class="num">Amount</th><td mat-cell *matCellDef="let p" class="num">{{ money(p.amountPaise) }}<div class="small muted">GST {{ money(p.taxPaise) }}</div></td></ng-container>
          <ng-container matColumnDef="s"><th mat-header-cell *matHeaderCellDef>Status</th><td mat-cell *matCellDef="let p"><span class="pill {{ p.status === 'captured' || p.status === 'paid' ? 'p-ok' : 'p-pend' }}">{{ p.status }}</span></td></ng-container>
          <ng-container matColumnDef="v"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let p"><button mat-icon-button (click)="invoice(p)" matTooltip="Invoice"><mat-icon>receipt_long</mat-icon></button></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="pCols"></tr><tr mat-row *matRowDef="let r; columns: pCols"></tr>
        </table>@if (!payments().length && !loading()) {<div class="empty small">No payments yet</div>}</div>
      }
      @case ('backups') {
        <div class="page-head"><div><h1>Backups</h1><div class="sub">Automatic nightly snapshots of every institution’s data</div></div><div class="grow"></div><button mat-flat-button (click)="runBackup()" [disabled]="busy()"><mat-icon>backup</mat-icon>Back up now</button></div>
        @if (bk(); as b) {
          <div class="kpis">
            <k3-kpi icon="schedule" label="Schedule" [value]="b.enabled ? 'Daily' : 'Off'" [delta]="'at ' + b.hourUtc + ':00 UTC · keep ' + b.keepDays + ' days'" />
            <k3-kpi icon="cloud_done" label="Last backup" [value]="b.status?.lastRunAt ? rel(b.status.lastRunAt) : '—'" [delta]="b.status?.ok === false ? 'FAILED: ' + b.status.error : b.status?.name || 'none yet'" [cls]="b.status?.ok === false ? 'down' : ''" />
            <k3-kpi icon="folder" label="Destination" [value]="b.backups.length + ' files'" [delta]="b.destination" />
          </div>
          @if (busy()) { <mat-progress-bar mode="indeterminate" /> }
          <div class="tbl-wrap"><table mat-table [dataSource]="b.backups">
            <ng-container matColumnDef="n"><th mat-header-cell *matHeaderCellDef>File</th><td mat-cell *matCellDef="let x" class="mono small">{{ x.name }}</td></ng-container>
            <ng-container matColumnDef="d"><th mat-header-cell *matHeaderCellDef>Created</th><td mat-cell *matCellDef="let x" class="nowrap">{{ dt(x.createdAt) }}</td></ng-container>
            <ng-container matColumnDef="s"><th mat-header-cell *matHeaderCellDef class="num">Size</th><td mat-cell *matCellDef="let x" class="num">{{ size(x.size) }}</td></ng-container>
            <ng-container matColumnDef="w"><th mat-header-cell *matHeaderCellDef>Stored</th><td mat-cell *matCellDef="let x">@if (x.local) {<span class="pill p-grey">Disk</span>} @if (x.s3) {<span class="pill p-blue">S3</span>}</td></ng-container>
            <ng-container matColumnDef="a"><th mat-header-cell *matHeaderCellDef></th><td mat-cell *matCellDef="let x"><button mat-icon-button (click)="download(x)" matTooltip="Download"><mat-icon>download</mat-icon></button></td></ng-container>
            <tr mat-header-row *matHeaderRowDef="bCols"></tr><tr mat-row *matRowDef="let r; columns: bCols"></tr>
          </table></div>
          <div class="banner info small" style="margin-top:16px"><mat-icon>restore</mat-icon><div>To restore: <code>node server/scripts/restore-backup.js &lt;file or s3:key&gt; --yes</code> against an empty database (see README → Backups).</div></div>
        } @else { <mat-progress-bar mode="indeterminate" /> }
      }
      @case ('company') {
        <div class="page-head"><div><h1>Company & keys</h1><div class="sub">Your details on GST invoices, plus integration status</div></div></div>
        @if (company(); as c) {
          <div class="grid g-2">
            <div class="card"><h3>Invoice details</h3><div class="card-sub">Seller details printed on every tax invoice</div>
              <mat-form-field class="full"><mat-label>Legal name</mat-label><input matInput [(ngModel)]="co.name"></mat-form-field>
              <mat-form-field class="full"><mat-label>Address</mat-label><textarea matInput rows="2" [(ngModel)]="co.address"></textarea></mat-form-field>
              <div class="grid g-2" style="gap:0 12px">
                <mat-form-field><mat-label>GSTIN</mat-label><input matInput [(ngModel)]="co.gstin" maxlength="15"></mat-form-field>
                <mat-form-field><mat-label>State</mat-label><input matInput [(ngModel)]="co.state"></mat-form-field>
                <mat-form-field><mat-label>Email</mat-label><input matInput [(ngModel)]="co.email"></mat-form-field>
                <mat-form-field><mat-label>Phone</mat-label><input matInput [(ngModel)]="co.phone"></mat-form-field>
              </div>
              <mat-form-field class="full"><mat-label>Invoice prefix</mat-label><input matInput [(ngModel)]="co.invoicePrefix"><mat-hint>e.g. K3 → K3/2026-27/0001</mat-hint></mat-form-field>
              <div class="row" style="justify-content:flex-end"><button mat-flat-button (click)="saveCompany()" [disabled]="busy()">Save</button></div></div>
            <div class="col" style="gap:16px">
              <div class="card"><div class="row"><h3 class="grow">Razorpay</h3><span class="pill {{ c.razorpay?.enabled ? 'p-ok' : 'p-grey' }}">{{ c.razorpay?.enabled ? 'Enabled' : 'Not configured' }}</span></div>
                <div class="kv small" style="margin-top:10px"><span class="k">Key ID</span><span class="mono">{{ c.razorpay?.keyId || '—' }}</span><span class="k">Webhook URL</span><span class="mono break">{{ c.razorpay?.webhookUrl }}</span><span class="k">Webhook secret</span><span>{{ c.razorpay?.webhookSecretSet ? 'Set' : 'Missing' }}</span></div>
                <p class="small muted">Razorpay Dashboard → Webhooks: add the URL above with events <code>subscription.*</code>, <code>payment.captured</code>, <code>order.paid</code>.</p></div>
              <div class="card"><div class="row"><h3 class="grow">WhatsApp Embedded Signup</h3><span class="pill {{ c.embeddedSignup?.enabled ? 'p-ok' : 'p-grey' }}">{{ c.embeddedSignup?.enabled ? 'Enabled' : 'Not configured' }}</span></div>
                <p class="small muted">Needs Meta Tech Provider approval. Set <code>META_APP_ID</code>, <code>META_APP_SECRET</code>, <code>META_ES_CONFIG_ID</code> (and optionally <code>META_ES_SOLUTION_ID</code>) — institutions then connect WhatsApp in one click.</p>
                @if (c.embeddedSignup?.webhookUrl) {<div class="kv small"><span class="k">App webhook</span><span class="mono break">{{ c.embeddedSignup.webhookUrl }}</span></div>}</div>
            </div>
          </div>
        } @else { <mat-progress-bar mode="indeterminate" /> }
      }
      @case ('security') {
        <div class="page-head"><div><h1>My security</h1><div class="sub">Protect your platform-admin sign-in and review activity across all schools</div></div></div>
        <k3-settings-security [platform]="true" />
      }
      @case ('admins') {
        <div class="page-head"><div><h1>Platform admins</h1><div class="sub">People who can manage every institution, plan and payment</div></div></div>
        <div class="grid g-12">
          <div class="card"><h3>Add admin</h3>
            <mat-form-field class="full"><mat-label>Name</mat-label><input matInput [(ngModel)]="na.name"></mat-form-field>
            <mat-form-field class="full"><mat-label>Email</mat-label><input matInput type="email" [(ngModel)]="na.email"></mat-form-field>
            <mat-form-field class="full"><mat-label>Password</mat-label><input matInput [(ngModel)]="na.password"></mat-form-field>
            <div class="row" style="justify-content:flex-end"><button mat-flat-button (click)="addAdmin()" [disabled]="busy() || !na.email || na.password.length < 10">Add admin</button></div></div>
          <div class="tbl-wrap"><table class="simple"><thead><tr><th>Name</th><th>Email</th><th>Last sign-in</th></tr></thead><tbody>
            @for (a of admins(); track a.id) {<tr><td>{{ a.name }}</td><td>{{ a.email }}</td><td class="muted">{{ rel(a.lastLoginAt) }}</td></tr>}</tbody></table></div>
        </div>
      }
    }
  </div>`,
  styles: [`.n{font:var(--mat-sys-title-small)} h3{margin:0;font:var(--mat-sys-title-medium)} .break{word-break:break-all}
    .plans{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}`],
})
export class PlatformPage {
  private api = inject(Api); private s = inject(Session); private ui = inject(Ui); private router = inject(Router);
  tab = input<string>();
  cur = computed(() => ['institutions', 'plans', 'payments', 'backups', 'company', 'admins', 'security'].includes(this.tab() || '') ? this.tab()! : 'institutions');
  num = num; rel = rel; money = rupees; d = (a: string) => fmtDate(a); dt = (a: string) => fmtDate(a, { dateStyle: 'medium', timeStyle: 'short' });
  isPast = (a: string) => new Date(a) < new Date(); size = (b: number) => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
  tCols = ['n', 'p', 'x', 'u', 'l', 'm', 'w', 's', 'a']; pCols = ['i', 't', 'd', 'a', 's', 'v']; bCols = ['n', 'd', 's', 'w', 'a'];
  loading = signal(true); busy = signal(false);
  tenants = signal<any[]>([]); plans = signal<any[]>([]); payments = signal<any[]>([]); bk = signal<any>(null); company = signal<any>(null); admins = signal<any[]>([]);
  co: any = {}; na = { name: '', email: '', password: '' };
  active = computed(() => this.tenants().filter(t => t.status === 'active').length);
  paying = computed(() => this.tenants().filter(t => t.billingStatus === 'active').length);
  trials = computed(() => this.tenants().filter(t => t.billingStatus === 'trial').length);
  sum = (k: string) => this.tenants().reduce((a, t) => a + (t[k] || 0), 0);
  okPay = (p: any) => p.status === 'captured' || p.status === 'paid';
  collected = computed(() => this.payments().filter(this.okPay).reduce((a, p) => a + p.amountPaise, 0));
  thisMonth = computed(() => { const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0); return this.payments().filter(p => this.okPay(p) && new Date(p.createdAt) >= m).reduce((a, p) => a + p.amountPaise, 0); });
  bill = (t: any): [string, string] => ({ trial: ['Trial', 'p-blue'], active: ['Paying', 'p-ok'], manual: ['Manual', 'p-grey'], halted: ['Payment failed', 'p-bad'], past_due: ['Past due', 'p-pend'], pending: ['Pending', 'p-pend'], cancelled: ['Cancelled', 'p-grey'] } as any)[t.billingStatus] || [t.billingStatus || '—', 'p-grey'];
  constructor() { this.loadAll(); }
  async loadAll() {
    try {
      const [t, p, pay, c, a] = await Promise.all([this.api.tenants(), this.api.plans(), this.api.payments(), this.api.company(), this.api.platformAdmins()]);
      this.tenants.set(t); this.plans.set(p); this.payments.set(pay); this.company.set(c); this.admins.set(a);
      this.co = { name: c.name, address: c.address, gstin: c.gstin, state: c.state, email: c.email, phone: c.phone, invoicePrefix: c.invoicePrefix };
      this.api.backups().then(b => this.bk.set(b)).catch(e => this.ui.error(e));
    } catch (e) { this.ui.error(e); }
    this.loading.set(false);
  }
  editTenant(t: any) { this.ui.open(TenantDialog, t, { width: '600px' }).afterClosed().subscribe(ok => ok && this.loadAll()); }
  async toggleTenant(t: any) {
    const to = t.status === 'active' ? 'suspended' : 'active';
    if (to === 'suspended' && !(await this.ui.confirm(`Suspend ${t.name}?`, 'Their users can no longer sign in and automations stop. Data is kept.', 'Suspend', 'block'))) return;
    try { await this.api.updateTenant(t.id, { status: to }); this.ui.toast(to === 'active' ? 'Re-activated' : 'Suspended'); this.loadAll(); } catch (e) { this.ui.error(e); }
  }
  async open(t: any) {
    const o = await firstValueFrom(this.ui.open(SupportDialog, t, { width: '480px' }).afterClosed()); if (!o) return;
    try { const r = await this.api.impersonate(t.id, o); this.s.setImp(r.token); this.s.ready.set(false); await this.s.init(); this.router.navigateByUrl(this.s.billingLocked() ? '/settings/billing' : '/home'); this.ui.toast(`Support session: ${t.name}`); }
    catch (e) { this.ui.error(e); }
  }
  async demo() {
    this.busy.set(true);
    try { const r = await this.api.createDemo({}); await this.ui.confirm('Demo school ready', `“${r.name}” is filled with sample leads, chats, broadcasts and reports.\n\nAdmin sign-in\nEmail: ${r.email}\nPassword: ${r.password}\n\nUse “Open” to walk through it now.`, 'Done', 'science'); this.loadAll(); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  editPlan(p: any) { this.ui.open(PlanDialog, p, { width: '640px' }).afterClosed().subscribe(ok => ok && this.loadAll()); }
  async invoice(p: any) { try { this.ui.openHtml(await this.api.platformInvoiceHtml(p.id)); } catch (e) { this.ui.error(e); } }
  async runBackup() {
    this.busy.set(true);
    try { const r = await this.api.runBackup(); this.ui.toast(`Backup created · ${Object.values(r.counts || {}).reduce((a: number, n: any) => a + n, 0)} rows`); this.bk.set(await this.api.backups()); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  async download(x: any) { try { this.ui.download(await this.api.backupBlob(x.name), x.name); } catch (e) { this.ui.error(e); } }
  async saveCompany() { this.busy.set(true); try { await this.api.saveCompany(this.co); this.company.set(await this.api.company()); this.ui.toast('Company details saved'); } catch (e) { this.ui.error(e); } this.busy.set(false); }
  async addAdmin() { this.busy.set(true); try { await this.api.addPlatformAdmin(this.na); this.na = { name: '', email: '', password: '' }; this.admins.set(await this.api.platformAdmins()); this.ui.toast('Admin added'); } catch (e) { this.ui.error(e); } this.busy.set(false); }
}
