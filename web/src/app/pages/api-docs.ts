import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Ui } from '../core/ui.service';

const ENDPOINTS: string[][] = [
  ['POST', '/auth/login', 'Sign in → JWT'], ['GET', '/auth/me', 'Current user & institution'],
  ['GET', '/meta', 'Lookups: programs, sources, stages, counsellors, triggers'],
  ['GET', '/leads', 'List leads. Query: q, temp, stage, source, program, counsellor'], ['GET', '/leads/:id', 'Lead profile, AI qualification, messages, timeline'],
  ['POST', '/leads', 'Create lead (sends WhatsApp welcome, starts automations)'], ['PATCH', '/leads/:id', 'Update stage, counsellor, tags, opt-out'],
  ['POST', '/leads/:id/notes', 'Add a note'], ['POST', '/leads/import', 'Bulk import rows'], ['POST', '/leads/:id/qualify', 'AI-qualify one lead'], ['POST', '/leads/qualify', 'AI-qualify all leads'],
  ['GET', '/conversations', 'WhatsApp inbox'], ['GET', '/leads/:id/messages', 'WhatsApp thread'], ['POST', '/leads/:id/messages', 'Send text / template / media'],
  ['GET', '/followups', 'Follow-up tasks'], ['POST', '/followups', 'Create task'], ['PATCH', '/followups/:id', 'Complete / snooze / reassign'],
  ['GET', '/sequences', 'Nurture sequences'], ['POST', '/sequences', 'Create sequence'], ['PATCH', '/sequences/:id', 'Activate / pause / edit'], ['POST', '/sequences/:id/enroll', 'Enroll leads'],
  ['GET', '/templates', 'WhatsApp templates'], ['POST', '/templates', 'Submit template to Meta'], ['POST', '/templates/sync', 'Sync templates & statuses from Meta'],
  ['POST', '/media', 'Upload creative (multipart) → WhatsApp media'], ['POST', '/broadcasts/audience', 'Audience size'], ['GET', '/broadcasts', 'Campaigns + stats'], ['POST', '/broadcasts', 'Create / schedule'], ['POST', '/broadcasts/:id/send', 'Send now'],
  ['GET', '/reports/overview', 'Reports. Query: range=7d|30d|90d'], ['POST', '/ai/classify', 'Classify a message'], ['GET', '/ai/config', 'AI settings'], ['PUT', '/ai/config', 'Update AI settings'],
  ['GET', '/events', 'Realtime stream (SSE)'], ['GET', '/settings', 'Institution settings'], ['PUT', '/settings', 'Update settings & credentials'], ['GET', '/team', 'Users'], ['POST', '/team', 'Add user'],
  ['GET', '/billing', 'Plan, subscription & invoices'], ['POST', '/billing/checkout', 'Start Razorpay checkout'], ['POST', '/billing/verify', 'Verify payment signature'], ['POST', '/settings/whatsapp/embedded', 'WhatsApp one-click signup (Embedded Signup)'],
  ['GET', '/webhooks/whatsapp/:key', 'Meta webhook verification'], ['POST', '/webhooks/whatsapp/:key', 'Inbound messages, statuses, template updates, Lead Ads'],
  ['POST', '/hooks/leads/:key', 'Website / any form → lead'], ['POST', '/hooks/google-ads/:key', 'Google Ads lead form webhook'],
];
const INTEG: string[][] = [['ads_click', '#1877f2', 'Meta Lead Ads', 'Facebook & Instagram lead forms → webhook', 'Built in'], ['search', '#ea4335', 'Google Ads lead forms', 'Webhook with your key', 'Built in'], ['language', '#188038', 'Website enquiry form', 'POST /hooks/leads/:key — any form builder', 'Built in'], ['chat', '#25d366', 'WhatsApp Cloud API', 'One-click signup or manual credentials', 'Built in'], ['credit_card', '#0b72e7', 'Razorpay', 'Subscriptions, invoices & GST', 'Built in'], ['call', '#5f6368', 'Telephony (Exotel / Knowlarity)', 'Click-to-call & call logs', 'Roadmap']];

@Component({
  selector: 'k3-api-docs', imports: [MatButtonModule, MatIconModule, MatTableModule],
  template: `
  <div class="page">
    <div class="page-head"><div><h1>API & Integrations</h1><div class="sub">Everything in this CRM runs through one documented REST API</div></div></div>
    <div class="grid g-2" style="margin-bottom:16px">
      <div class="card"><div class="card-head"><div><h3>You are viewing the demo</h3><div class="card-sub">Sample data, running entirely in your browser</div></div></div>
        <p style="margin-top:0">The production build ships with a Node.js + PostgreSQL server that implements every endpoint below against the <b>Meta WhatsApp Cloud API</b> — with logins for each institution, Razorpay billing, automated backups and a platform owner console.</p>
        <div class="kv" style="grid-template-columns:150px 1fr;margin:12px 0"><span class="k">Mode</span><span class="pill p-pend">Demo API</span><span class="k">Endpoints</span><span>{{ eps.length }}</span></div>
        <button mat-button (click)="reset()"><mat-icon>restart_alt</mat-icon>Reset demo data</button></div>
      <div class="card"><div class="card-head"><div><h3>Calling the API</h3><div class="card-sub">Bearer token from /auth/login</div></div></div>
<div class="code">curl -X POST https://crm.yourschool.in/api/v1/auth/login \\
  -H 'content-type: application/json' \\
  -d '&#123;"email":"admin@school.in","password":"…"&#125;'

curl https://crm.yourschool.in/api/v1/leads?temp=hot \\
  -H 'authorization: Bearer &lt;token&gt;'

# website form → lead (no login, per-school key)
curl -X POST https://crm.yourschool.in/hooks/leads/&lt;key&gt; \\
  -d 'parent=Rina Das&amp;phone=9830012345&amp;program=Class 6'</div></div>
    </div>
    <div class="card" style="margin-bottom:16px"><div class="card-head"><div><h3>Lead sources & channels</h3></div></div>
      <div class="grid g-3">@for (i of integ; track i[2]) {<div class="integ"><div class="ii" [style.background]="i[1]"><mat-icon class="fill">{{ i[0] }}</mat-icon></div><div class="grow" style="min-width:0"><div class="t">{{ i[2] }}</div><div class="small muted">{{ i[3] }}</div></div><span class="pill {{ i[4] === 'Roadmap' ? 'p-grey' : 'p-ok' }}">{{ i[4] }}</span></div>}</div></div>
    <div class="card"><div class="card-head"><div><h3>Endpoint contract</h3><div class="card-sub">{{ eps.length }} endpoints under /api/v1</div></div></div>
      <div class="tbl-wrap flat"><table class="simple"><thead><tr><th style="width:80px">Method</th><th>Path</th><th>Purpose</th></tr></thead><tbody>
        @for (e of eps; track e[0] + e[1]) {<tr><td><span class="method m-{{ e[0] }}">{{ e[0] }}</span></td><td><code>{{ e[1] }}</code></td><td class="muted">{{ e[2] }}</td></tr>}
      </tbody></table></div></div>
  </div>`,
  styles: [`.integ{display:flex;gap:12px;align-items:center;border:1px solid var(--mat-sys-outline-variant);border-radius:16px;padding:12px} .ii{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#fff;flex:none} .t{font:var(--mat-sys-title-small)}
    .method{font:var(--mat-sys-label-small);font-family:'Roboto Mono',monospace;padding:3px 6px;border-radius:6px;background:#e3eeff;color:#1967d2} .m-POST{background:#e6f4ea;color:#137333} .m-PATCH,.m-PUT{background:#fff0d6;color:#a05a00} .m-DELETE{background:#fce8e6;color:#c5221f}`],
})
export class ApiDocsPage {
  private ui = inject(Ui); eps = ENDPOINTS; integ = INTEG;
  async reset() { if (!(await this.ui.confirm('Reset demo data?', 'All demo leads, chats, broadcasts and settings go back to the original sample data.', 'Reset'))) return; (window as any).MockServer?.reset?.(); (window as any).DemoExtra?.reset?.(); location.reload(); }
}
