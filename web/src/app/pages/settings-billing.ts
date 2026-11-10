/* Settings → Plan & billing: Razorpay subscriptions / one-time licence, GST details, invoices */
import { Component, computed, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { loadScript } from '../core/loader';
import { fmtDate, rupees } from '../core/util';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';

const STATUS: Record<string, [string, string]> = { trial: ['Free trial', 'p-blue'], active: ['Active', 'p-ok'], manual: ['Managed by K3', 'p-grey'], pending: ['Payment pending', 'p-pend'], past_due: ['Payment due', 'p-pend'], halted: ['Payment failed', 'p-bad'], cancelled: ['Cancelled', 'p-grey'], completed: ['Completed', 'p-grey'], expired: ['Expired', 'p-bad'] };

@Component({
  selector: 'k3-settings-billing',
  imports: [...FORM, MatTableModule, MatProgressBarModule],
  template: `
  @if (!b()) { <mat-progress-bar mode="indeterminate" /> } @else {
    @if (b().locked) { <div class="banner err"><mat-icon>lock</mat-icon><div class="grow"><b>Your access has ended.</b> Choose a plan below to restore the CRM instantly — all your leads, chats and settings are kept.</div></div> }
    <div class="card" style="margin-bottom:16px">
      <div class="row wrap" style="align-items:flex-start">
        <div class="grow"><div class="small muted">Current plan</div><div class="plan-name">{{ b().plan?.name || '—' }}</div>
          <div class="row wrap small" style="margin-top:6px"><span class="pill {{ st()[1] }}">{{ st()[0] }}</span>
            @if (b().accessUntil) { <span class="muted">{{ b().status === 'trial' ? 'Trial ends' : b().hasSubscription ? 'Renews' : 'Access until' }} {{ d(b().accessUntil) }}</span> }</div></div>
        @if (b().hasSubscription) { <button mat-stroked-button (click)="cancel()" [disabled]="busy()"><mat-icon>cancel</mat-icon>Cancel subscription</button> }
      </div>
    </div>
    @if (!b().enabled && !demo) { <div class="banner info"><mat-icon>info</mat-icon><div>Online payments are not enabled on this server yet. Contact K3 Solutions to renew or change your plan.</div></div> }
    <h3 class="sec">Plans</h3>
    <div class="plans">
      @for (p of b().plans; track p.id) {
        <div class="plan-card" [class.current]="p.id === b().plan?.id">
          <div class="row"><b class="grow">{{ p.name }}</b>@if (p.id === b().plan?.id) {<span class="pill p-ok">Current</span>}</div>
          <div class="price">{{ money(p.pricePaise) }}<span class="per">{{ per(p.billing) }}</span></div>
          <div class="small muted">+ {{ p.gstPercent }}% GST · {{ money(p.totalPaise) }} total</div>
          @if (p.description) { <div class="small">{{ p.description }}</div> }
          <ul>
            <li>{{ p.maxUsers }} team members</li><li>{{ p.maxContacts.toLocaleString('en-IN') }} contacts</li>
            @for (f of p.features || []; track f) {<li>{{ f }}</li>}
          </ul>
          <span class="grow"></span>
          <button mat-flat-button (click)="buy(p)" [disabled]="busy() || (!b().enabled && !demo) || (p.id === b().plan?.id && b().hasSubscription)">
            {{ p.id === b().plan?.id && b().hasSubscription ? 'Current plan' : p.billing === 'one_time' ? 'Buy licence' : b().status === 'active' ? 'Switch plan' : 'Subscribe' }}</button>
        </div>
      }
    </div>
    <div class="grid g-2" style="margin-top:16px">
      <div class="card"><h3>Billing details</h3><div class="card-sub">Printed on your GST invoices</div>
        <mat-form-field class="full"><mat-label>Billing email</mat-label><input matInput type="email" [(ngModel)]="det.billingEmail"></mat-form-field>
        <mat-form-field class="full"><mat-label>GSTIN (optional)</mat-label><input matInput [(ngModel)]="det.gstin" maxlength="15" placeholder="19ABCDE1234F1Z5"></mat-form-field>
        <mat-form-field class="full"><mat-label>Billing address</mat-label><textarea matInput rows="3" [(ngModel)]="det.address"></textarea></mat-form-field>
        <div class="row" style="justify-content:flex-end"><button mat-flat-button (click)="saveDetails()" [disabled]="busy()">Save details</button></div></div>
      <div class="card"><h3>Invoices</h3><div class="card-sub">Tax invoices for every payment</div>
        @if (b().payments.length) {
          <div class="tbl-wrap flat"><table class="simple"><thead><tr><th>Invoice</th><th>Date</th><th class="num">Amount</th><th></th></tr></thead><tbody>
            @for (p of b().payments; track p.id) {<tr><td class="nowrap">{{ p.invoiceNo || '—' }}<div class="small muted">{{ p.description }}</div></td><td class="nowrap">{{ d(p.createdAt) }}</td><td class="num">{{ money(p.amountPaise) }}</td>
              <td><button mat-icon-button (click)="invoice(p)" [disabled]="p.status !== 'captured' && p.status !== 'paid'" aria-label="View invoice"><mat-icon>receipt_long</mat-icon></button></td></tr>}
          </tbody></table></div>
        } @else { <div class="empty small">No payments yet</div> }
      </div>
    </div>
  }`,
  styles: [`.plan-name{font:var(--mat-sys-headline-small)} .sec{font:var(--mat-sys-title-medium);margin:20px 0 12px} h3{margin:0;font:var(--mat-sys-title-medium)}
    .plans{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px} .per{font:var(--mat-sys-body-medium);color:var(--mat-sys-on-surface-variant);margin-left:4px}`],
})
export class SettingsBilling {
  private api = inject(Api); private s = inject(Session); private ui = inject(Ui);
  demo = environment.demo; b = signal<any>(null); busy = signal(false); det: any = {};
  money = rupees; d = (a: string) => fmtDate(a);
  per = (b: string) => b === 'monthly' ? '/month' : b === 'yearly' ? '/year' : ' one-time';
  st = computed(() => STATUS[this.b()?.status] || [this.b()?.status || '—', 'p-grey']);
  constructor() { this.load(); }
  async load() {
    try {
      const b = await this.api.billing();
      this.b.set(b); this.det = { billingEmail: b.billingEmail, gstin: b.gstin, address: b.address };
    } catch (e) { this.ui.error(e); }
  }
  async saveDetails() { this.busy.set(true); try { await this.api.billingDetails(this.det); this.ui.toast('Billing details saved'); } catch (e) { this.ui.error(e); } this.busy.set(false); }
  async invoice(p: any) { try { this.ui.openHtml(await this.api.invoiceHtml(p.id)); } catch (e) { this.ui.error(e); } }
  async cancel() {
    if (!(await this.ui.confirm('Cancel subscription?', 'Auto-renewal stops. You keep full access until the end of the current billing period.', 'Cancel subscription', 'cancel'))) return;
    this.busy.set(true); try { await this.api.cancelSubscription(false); this.ui.toast('Subscription cancelled — access continues until the period ends'); await this.load(); await this.s.refreshMe(); } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  async buy(p: any) {
    if (this.demo) { this.ui.toast('In the live product this opens Razorpay Checkout (UPI, cards, netbanking) with GST invoice.'); return; }
    this.busy.set(true);
    try {
      const o = await this.api.checkout(p.id);
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      const opts: any = { key: o.key, name: o.name, description: o.description, image: location.origin + '/k3-logo.png', prefill: o.prefill, notes: o.notes, theme: { color: '#1a5fb4' },
        handler: async (resp: any) => {
          this.busy.set(true);
          try { await this.api.verifyPayment(resp); this.ui.toast('Payment successful — thank you! Your plan is active.'); await this.s.refreshMe(); await this.load(); }
          catch (e) { this.ui.error(e); } this.busy.set(false);
        },
        modal: { ondismiss: () => this.busy.set(false), confirm_close: true } };
      if (o.mode === 'order') Object.assign(opts, { order_id: o.order_id, amount: o.amount, currency: o.currency }); else opts.subscription_id = o.subscription_id;
      const rz = new (window as any).Razorpay(opts);
      rz.on('payment.failed', (r: any) => this.ui.toast('Payment failed: ' + (r?.error?.description || 'please try again'), 'Close', undefined, 8000));
      rz.open();
    } catch (e) { this.ui.error(e); this.busy.set(false); }
  }
}
