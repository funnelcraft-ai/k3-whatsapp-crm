import { Component, inject, input, signal } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { rel } from '../core/util';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';

const LABEL: Record<string, string> = {
  'login.success': 'Signed in', 'login.failed': 'Failed sign-in attempt', 'password.changed': 'Password changed', 'session.revoke_all': 'Signed out of all devices',
  '2fa.enabled': 'Two-factor turned on', '2fa.disabled': 'Two-factor turned off', '2fa.recovery_code_used': 'Recovery code used',
  'support.start': 'K3 support session started', 'support.change': 'K3 support made a change', 'settings.integration_changed': 'Integration / security settings changed', 'settings.webhook_key_rotated': 'Webhook key rotated',
  'platform.tenant_created': 'School created', 'platform.tenant_updated': 'School updated', 'platform.plan_created': 'Plan created', 'platform.plan_updated': 'Plan updated', 'platform.company_updated': 'Company details updated', 'platform.backup_created': 'Backup created', 'platform.backup_downloaded': 'Backup downloaded', 'platform.demo_created': 'Demo school created', 'platform.admin_added': 'Platform admin added',
  'team.user_added': 'Team member added', 'team.user_updated': 'Team member changed',
};
const label = (a: string) => LABEL[a] || a.replace(/[._]/g, ' ');

@Component({
  selector: 'k3-settings-security',
  imports: [...FORM, MatSlideToggleModule, MatProgressBarModule],
  template: `
  @if (demo) { <div class="banner small"><mat-icon>info</mat-icon>Security settings are available in the live product.</div> }
  @else {
  <div class="grid">
    <section class="card">
      <h3>Two-factor authentication</h3>
      <p class="muted small">Adds a 6-digit code from an authenticator app (Google Authenticator, Microsoft Authenticator, Authy…) to your sign-in. Recommended for every admin.</p>
      @if (codes().length) {
        <div class="banner warn small"><mat-icon>key</mat-icon>Save these recovery codes somewhere safe. Each works once if you lose your phone. They will not be shown again.</div>
        <div class="copy-row"><code class="grow" style="white-space:pre-line">{{ codes().join('\\n') }}</code><button mat-icon-button (click)="copy(codes().join('\\n'))" aria-label="Copy codes"><mat-icon>content_copy</mat-icon></button></div>
        <button mat-flat-button (click)="codes.set([]); setup.set(null)">I have saved them</button>
      } @else if (tf() === null) { <mat-progress-bar mode="indeterminate" /> }
      @else if (tf()!.enabled) {
        <div class="row" style="gap:8px"><mat-icon style="color:var(--mat-sys-primary)">verified_user</mat-icon><b>On</b><span class="muted small">· {{ tf()!.recoveryCodesLeft }} recovery codes left</span></div>
        <mat-form-field appearance="outline" class="full"><mat-label>Your password</mat-label><input matInput type="password" name="dpw" [(ngModel)]="pw" autocomplete="current-password"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Next 6-digit code (wait for a fresh one)</mat-label><input matInput inputmode="numeric" name="dcode" [(ngModel)]="code" autocomplete="one-time-code" maxlength="8"></mat-form-field>
        <button mat-stroked-button (click)="disable()" [disabled]="busy() || !pw || !code">Turn off two-factor</button>
      } @else if (!setup()) {
        <mat-form-field appearance="outline" class="full"><mat-label>Your password</mat-label><input matInput type="password" name="spw" [(ngModel)]="pw" autocomplete="current-password"></mat-form-field>
        <button mat-flat-button (click)="start()" [disabled]="busy() || !pw">Set up two-factor</button>
      } @else {
        <ol class="small steps">
          <li>In your authenticator app choose <b>Add account → Enter a setup key</b> and type this key:</li>
        </ol>
        <div class="copy-row"><code class="grow break">{{ setup()!.secret }}</code><button mat-icon-button (click)="copy(setup()!.secret)" aria-label="Copy key"><mat-icon>content_copy</mat-icon></button></div>
        <mat-form-field appearance="outline" class="full" style="margin-top:12px"><mat-label>6-digit code from the app</mat-label><input matInput inputmode="numeric" name="ecode" [(ngModel)]="code" autocomplete="one-time-code" maxlength="8"></mat-form-field>
        <div class="row" style="gap:8px"><button mat-flat-button (click)="enable()" [disabled]="busy() || !code">Turn on</button><button mat-button (click)="setup.set(null)">Cancel</button></div>
      }
    </section>

    @if (!platform()) {
    <section class="card">
      <h3>K3 Solutions support access</h3>
      <p class="muted small">When something needs fixing, K3 support can sign in to your school as an admin for up to 2 hours. Every support session and every change made in it is recorded in the activity log below. Turn this off to block it completely — you can switch it back on when you need help.</p>
      @if (support() === null) { <mat-progress-bar mode="indeterminate" /> }
      @else { <mat-slide-toggle [checked]="support()!" (change)="setSupport($event.checked)" [disabled]="busy()">Allow K3 support to access this school</mat-slide-toggle> }
      <hr>
      <h3>Devices</h3>
      <p class="muted small">Lost a phone or used a shared computer? Sign out everywhere — you will need to sign in again on this device too.</p>
      <button mat-stroked-button (click)="signOutAll()" [disabled]="busy()"><mat-icon>logout</mat-icon>Sign out of all devices</button>
    </section>
    } @else {
    <section class="card">
      <h3>Devices</h3>
      <p class="muted small">Lost a phone or used a shared computer? Sign out everywhere — you will need to sign in again on this device too.</p>
      <button mat-stroked-button (click)="signOutAll()" [disabled]="busy()"><mat-icon>logout</mat-icon>Sign out of all devices</button>
    </section>
    }
  </div>

  <section class="card" style="margin-top:16px">
    <div class="row" style="justify-content:space-between;flex-wrap:wrap;gap:8px">
      <h3>{{ platform() ? 'Platform activity log' : 'Activity log' }}</h3>
      <mat-slide-toggle [checked]="onlySupport()" (change)="onlySupport.set($event.checked); loadLog()">K3 support only</mat-slide-toggle>
    </div>
    @if (log() === null) { <mat-progress-bar mode="indeterminate" /> }
    @else if (!log()!.length) { <p class="muted small">Nothing recorded yet.</p> }
    @else {
      <div class="tbl-wrap"><table class="log">
        <thead><tr><th>When</th><th>Who</th><th>What</th><th>Details</th></tr></thead>
        <tbody>
        @for (a of log(); track a.id) {
          <tr [class.sup]="a.support">
            <td class="nowrap" [title]="a.at">{{ rel(a.at) }}</td>
            <td>{{ a.actor || '—' }}@if (a.support) { <span class="chip">K3 support</span> }</td>
            <td>{{ label(a.action) }}</td>
            <td class="small muted">{{ [platform() ? a.tenantName : '', a.target, a.detail?.reason, a.detail?.readOnly ? 'read-only' : '', a.ip].filter(x => x).join(' · ') }}</td>
          </tr>
        }
        </tbody></table></div>
    }
  </section>
  }`,
  styles: [`.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px} .card{border:1px solid var(--mat-sys-outline-variant);border-radius:16px;padding:20px}
    h3{margin:0 0 8px;font:var(--mat-sys-title-medium)} hr{border:0;border-top:1px solid var(--mat-sys-outline-variant);margin:20px 0}
    .copy-row{display:flex;align-items:center;gap:8px;border:1px solid var(--mat-sys-outline-variant);border-radius:12px;padding:6px 6px 6px 12px;margin:10px 0} .break{word-break:break-all} .steps{padding-left:18px;margin:8px 0}
    .tbl-wrap{overflow:auto} .log{width:100%;border-collapse:collapse;font:var(--mat-sys-body-medium)} .log th{text-align:left;font:var(--mat-sys-label-large);padding:8px;border-bottom:1px solid var(--mat-sys-outline-variant)} .log td{padding:8px;border-bottom:1px solid var(--mat-sys-outline-variant);vertical-align:top}
    .nowrap{white-space:nowrap} .sup{background:var(--mat-sys-surface-container-low)} .chip{margin-left:6px;padding:1px 8px;border-radius:999px;background:var(--mat-sys-tertiary-container);color:var(--mat-sys-on-tertiary-container);font:var(--mat-sys-label-small)}`],
})
export class SettingsSecurity {
  private api = inject(Api); private s = inject(Session); private ui = inject(Ui);
  platform = input(false);
  demo = environment.demo; rel = rel; label = label;
  tf = signal<{ enabled: boolean; recoveryCodesLeft: number } | null>(null); support = signal<boolean | null>(null);
  setup = signal<{ secret: string; otpauthUrl: string } | null>(null); codes = signal<string[]>([]);
  log = signal<any[] | null>(null); onlySupport = signal(false); busy = signal(false);
  pw = ''; code = '';
  constructor() { if (!this.demo) queueMicrotask(() => this.load()); }   // after inputs are bound
  async load() {
    try {
      if (this.platform()) this.tf.set(await this.api.twoFactor());
      else { const [tf, st] = await Promise.all([this.api.twoFactor(), this.api.settings()]); this.tf.set(tf); this.support.set(st?.security?.supportAccess !== false); }
    } catch (e) { this.ui.error(e); }
    this.loadLog();
  }
  async loadLog() { try { const q = { support: this.onlySupport() ? 1 : '', limit: 100 }; this.log.set(this.platform() ? await this.api.platformAudit(q) : await this.api.audit(q)); } catch (e) { this.ui.error(e); } }
  private async run(fn: () => Promise<void>) { this.busy.set(true); try { await fn(); } catch (e) { this.ui.error(e); } this.busy.set(false); }
  start() { return this.run(async () => { this.setup.set(await this.api.twoFactorSetup(this.pw)); this.pw = ''; this.code = ''; }); }
  enable() { return this.run(async () => { const r = await this.api.twoFactorEnable(this.code); this.codes.set(r.recoveryCodes || []); this.code = ''; this.tf.set(await this.api.twoFactor()); this.loadLog(); }); }
  disable() {
    return this.run(async () => {
      await this.api.twoFactorDisable(this.pw, this.code); this.pw = ''; this.code = '';
      this.ui.toast('Two-factor turned off — please sign in again'); this.s.logout();   // turning it off signs every session out
    });
  }
  setSupport(on: boolean) { return this.run(async () => { await this.api.saveSettings({ security: { supportAccess: on } }); this.support.set(on); this.ui.toast(on ? 'K3 support access is on' : 'K3 support access is off'); this.loadLog(); }); }
  async signOutAll() {
    if (!(await this.ui.confirm('Sign out of all devices?', 'Everyone using your account — including this device — will have to sign in again.', 'Sign out everywhere', 'logout'))) return;
    await this.run(async () => { await this.api.logoutAll(); this.s.logout(); });
  }
  copy(t: string) { navigator.clipboard?.writeText(t).then(() => this.ui.toast('Copied'), () => this.ui.toast('Copy failed — select and copy manually')); }
}
