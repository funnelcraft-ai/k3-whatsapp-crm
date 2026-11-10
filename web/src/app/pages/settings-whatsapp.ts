/* Settings → WhatsApp: one-click Embedded Signup (Meta Tech Provider) or manual Cloud API credentials */
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { loadScript } from '../core/loader';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';

@Component({
  selector: 'k3-settings-whatsapp',
  imports: [...FORM, MatExpansionModule, MatTooltipModule],
  template: `
  @let w = data().whatsapp;
  <div class="grid g-21">
    <div class="col" style="gap:16px;min-width:0">
      <div class="card">
        <div class="row" style="align-items:flex-start">
          <div class="wa-ico"><mat-icon class="fill">chat</mat-icon></div>
          <div class="grow"><h3>WhatsApp Business number</h3>
            @if (connected()) { <div class="row wrap" style="margin-top:4px"><span class="pill p-ok"><mat-icon>check_circle</mat-icon>Connected</span><b>{{ w.displayNumber || w.phoneNumberId }}</b></div> }
            @else { <div class="small muted" style="margin-top:4px">Not connected yet — parents can’t receive messages until you connect a number.</div> }
          </div>
          @if (connected()) { <button mat-stroked-button (click)="test()" [disabled]="busy()"><mat-icon>network_check</mat-icon>Test</button> }
        </div>
        @if (es().enabled) {
          <div class="es">
            <div class="grow"><b>One-click WhatsApp signup</b><div class="small muted">Log in with Facebook, pick or create your WhatsApp Business Account and verify your number. We connect everything automatically — no tokens to copy.</div></div>
            <button mat-flat-button class="fb-btn" (click)="embedded()" [disabled]="busy()"><mat-icon>bolt</mat-icon>{{ connected() ? 'Reconnect with Facebook' : 'Connect with Facebook' }}</button>
          </div>
        } @else if (!demo) {
          <div class="banner info small" style="margin-top:14px"><mat-icon>info</mat-icon><div>One-click signup appears here once K3 Solutions enables Meta Embedded Signup on this server. Until then, connect with your own Cloud API credentials below.</div></div>
        }
        @if (status()) { <div class="banner {{ status()!.cls }} small" style="margin-top:12px"><mat-icon>{{ status()!.icon }}</mat-icon><div style="white-space:pre-line">{{ status()!.text }}</div></div> }
      </div>

      <mat-accordion>
        <mat-expansion-panel [expanded]="!es().enabled && !connected()">
          <mat-expansion-panel-header><mat-panel-title>Manual setup</mat-panel-title><mat-panel-description class="hide-xs">Cloud API credentials from your own Meta app</mat-panel-description></mat-expansion-panel-header>
          <div class="grid g-2" style="gap:0 12px">
            <mat-form-field><mat-label>Phone number ID</mat-label><input matInput [(ngModel)]="f.phoneNumberId"></mat-form-field>
            <mat-form-field><mat-label>WhatsApp Business Account ID</mat-label><input matInput [(ngModel)]="f.wabaId"></mat-form-field>
            <mat-form-field><mat-label>Display number</mat-label><input matInput [(ngModel)]="f.displayNumber" placeholder="+91 98300 12345"></mat-form-field>
            <mat-form-field><mat-label>Meta app ID</mat-label><input matInput [(ngModel)]="f.appId"></mat-form-field>
            <mat-form-field><mat-label>Permanent access token</mat-label><input matInput type="password" [(ngModel)]="f.accessToken" [placeholder]="w.hasAccessToken ? '•••••••• saved — leave blank to keep' : 'System-user token'" autocomplete="off"></mat-form-field>
            <mat-form-field><mat-label>App secret</mat-label><input matInput type="password" [(ngModel)]="f.appSecret" [placeholder]="w.hasAppSecret ? '•••••••• saved — leave blank to keep' : 'Verifies webhook signatures'" autocomplete="off"></mat-form-field>
          </div>
          <div class="row" style="justify-content:flex-end"><button mat-flat-button (click)="saveManual()" [disabled]="busy()">Save credentials</button></div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
    <div class="card"><h3>Webhook</h3><div class="card-sub">Only needed for manual setup — paste into Meta App → WhatsApp → Configuration and subscribe to <code>messages</code> and <code>message_template_status_update</code>.</div>
      <div class="copy-row"><div class="grow"><div class="small muted">Callback URL</div><div class="mono small break">{{ w.webhookUrl }}</div></div><button mat-icon-button (click)="ui.copy(w.webhookUrl, 'Webhook URL copied')" matTooltip="Copy"><mat-icon>content_copy</mat-icon></button></div>
      <div class="copy-row"><div class="grow"><div class="small muted">Verify token</div><div class="mono small break">{{ w.verifyToken }}</div></div><button mat-icon-button (click)="ui.copy(w.verifyToken, 'Verify token copied')" matTooltip="Copy"><mat-icon>content_copy</mat-icon></button></div>
      <button mat-button (click)="rotate()" [disabled]="busy() || demo"><mat-icon>autorenew</mat-icon>Rotate webhook key</button>
    </div>
  </div>`,
  styles: [`.wa-ico{width:44px;height:44px;border-radius:14px;background:#25d366;color:#fff;display:grid;place-items:center;flex:none;margin-right:6px} h3{margin:0;font:var(--mat-sys-title-medium)}
    .es{display:flex;gap:16px;align-items:center;margin-top:16px;padding:14px 16px;border-radius:16px;background:var(--mat-sys-surface-container)} .fb-btn{background:#1877f2!important;color:#fff!important;flex:none}
    .copy-row{display:flex;align-items:center;gap:8px;border:1px solid var(--mat-sys-outline-variant);border-radius:12px;padding:8px 8px 8px 12px;margin:10px 0} .break{word-break:break-all}
    @media (max-width:600px){.es{flex-direction:column;align-items:stretch}}`],
})
export class SettingsWhatsapp {
  private api = inject(Api); private s = inject(Session); ui = inject(Ui);
  data = input.required<any>(); changed = output<any>();
  demo = environment.demo; busy = signal(false); status = signal<{ cls: string; icon: string; text: string } | null>(null);
  es = computed(() => this.data().embeddedSignup || { enabled: false });
  connected = computed(() => { const w = this.data().whatsapp; return !!(w.phoneNumberId && w.hasAccessToken); });
  f: any = {};
  ngOnInit() { const w = this.data().whatsapp; this.f = { phoneNumberId: w.phoneNumberId, wabaId: w.wabaId, displayNumber: w.displayNumber, appId: w.appId, accessToken: '', appSecret: '' }; }

  async saveManual() {
    this.busy.set(true);
    try {
      const w: any = Object.assign({}, this.f); if (!w.accessToken) delete w.accessToken; if (!w.appSecret) delete w.appSecret;
      const out = await this.api.saveSettings({ whatsapp: w }); this.changed.emit(out); this.ui.toast('WhatsApp credentials saved');
      if (out.whatsapp.phoneNumberId && out.whatsapp.hasAccessToken) await this.test();
    } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  async test() {
    this.busy.set(true);
    try { const r = await this.api.testWhatsApp(); this.status.set({ cls: 'ok', icon: 'check_circle', text: `Connected to ${r.info?.display_phone_number || 'your number'}${r.info?.verified_name ? ' · ' + r.info.verified_name : ''}${r.info?.quality_rating ? ' · quality ' + r.info.quality_rating : ''}` }); this.s.reloadMeta(); }
    catch (e: any) { this.status.set({ cls: 'err', icon: 'error', text: e.message }); } this.busy.set(false);
  }
  async rotate() {
    if (!(await this.ui.confirm('Rotate webhook key?', 'Website forms, Google Ads and the Meta webhook must be updated with the new URLs, or new leads will stop arriving.', 'Rotate'))) return;
    try { this.changed.emit(await this.api.rotateWebhookKey()); this.ui.toast('Webhook key rotated — update your integrations'); } catch (e) { this.ui.error(e); }
  }

  /* Meta Embedded Signup — FB.login with the configuration ID; session info arrives via postMessage */
  async embedded() {
    if (this.demo) { this.ui.toast('In the live product this opens Facebook’s WhatsApp signup popup.'); return; }
    const es = this.es(); this.busy.set(true); this.status.set({ cls: 'info', icon: 'hourglass_top', text: 'Complete the steps in the Facebook window…' });
    try {
      await loadScript('https://connect.facebook.net/en_US/sdk.js', { crossorigin: 'anonymous' });
      const FB = (window as any).FB; FB.init({ appId: es.appId, autoLogAppEvents: true, xfbml: false, version: es.graphVersion || 'v21.0' });
      let session: any = null; let code: string | null = null; let done = false;
      const finish = async () => {
        if (done || !session || !code) return; done = true; window.removeEventListener('message', onMsg);
        this.status.set({ cls: 'info', icon: 'hourglass_top', text: 'Connecting your number, registering it with WhatsApp and syncing templates…' });
        try {
          const r = await this.api.embeddedSignup({ code, phoneNumberId: session.phone_number_id, wabaId: session.waba_id });
          this.changed.emit(r); this.s.reloadMeta();
          this.status.set({ cls: 'ok', icon: 'check_circle', text: `WhatsApp connected${r.verifiedName ? ' · ' + r.verifiedName : ''} · ${r.templatesSynced} templates synced${r.warnings?.length ? '\n' + r.warnings.join('\n') : ''}` });
        } catch (e: any) { this.status.set({ cls: 'err', icon: 'error', text: e.message }); }
        this.busy.set(false);
      };
      const onMsg = (ev: MessageEvent) => {
        if (!/(^|\.)facebook\.com$/.test(new URL(ev.origin).hostname)) return;
        try { const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data; if (d?.type !== 'WA_EMBEDDED_SIGNUP') return;
          if (d.event === 'FINISH' || d.event === 'FINISH_ONLY_WABA') { session = d.data; finish(); }
          else if (d.event === 'CANCEL') { done = true; window.removeEventListener('message', onMsg); this.status.set({ cls: 'warn', icon: 'info', text: `Signup cancelled${d.data?.current_step ? ' at “' + d.data.current_step + '”' : ''}.` }); this.busy.set(false); }
          else if (d.event === 'ERROR') { done = true; this.status.set({ cls: 'err', icon: 'error', text: d.data?.error_message || 'Meta reported an error during signup' }); this.busy.set(false); }
        } catch { /* not ours */ }
      };
      window.addEventListener('message', onMsg);
      FB.login((resp: any) => {
        if (resp?.authResponse?.code) { code = resp.authResponse.code; finish(); }
        else if (!done) { setTimeout(() => { if (!code && !done) { done = true; window.removeEventListener('message', onMsg); this.status.set({ cls: 'warn', icon: 'info', text: 'The Facebook window was closed before signup finished.' }); this.busy.set(false); } }, 1500); }
      }, { config_id: es.configId, response_type: 'code', override_default_response_type: true, extras: Object.assign({ setup: {}, featureType: '', sessionInfoVersion: '3' }, es.solutionId ? { setup: { solutionID: es.solutionId } } : {}) });
    } catch (e: any) { this.status.set({ cls: 'err', icon: 'error', text: e.message }); this.busy.set(false); }
  }
}
