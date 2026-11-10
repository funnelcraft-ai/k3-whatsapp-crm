import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { FU_TYPE, STAGES, STAGE_COLOR, TEMP, dueLabel, isToday, num, pct } from '../core/util';
import { Avatar, Chart, Kpi, Legend, StageTag, TempPill } from '../shared/bits';
import { LeadNav } from '../shared/lead-nav';
import { NewLeadDialog } from './leads-dialogs';

@Component({
  selector: 'k3-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, Avatar, Chart, Kpi, Legend, StageTag, TempPill],
  template: `
  @if (!d()) { <mat-progress-bar mode="indeterminate" /> } @else {
  <div class="page">
    <div class="page-head">
      <div><h1>Good {{ greet }}, {{ firstName() }}</h1><div class="sub">{{ s.meta().institution?.name }} · Admissions {{ s.meta().institution?.session || '' }}</div></div>
      <div class="grow"></div>
      <a mat-stroked-button routerLink="/reports"><mat-icon>monitoring</mat-icon>Full report</a>
      <button mat-flat-button (click)="newLead()"><mat-icon>person_add</mat-icon>New enquiry</button>
    </div>

    @if (!demo && !s.meta().whatsappConnected && s.role() === 'admin') {
      <div class="banner warn">
        <mat-icon class="fill" style="color:#25d366">chat</mat-icon>
        <div class="grow"><b>Connect your WhatsApp number to go live</b><div class="small muted">Use one-click WhatsApp signup (or paste Cloud API credentials), sync templates, then switch on nurture sequences. Form leads are already being captured.</div></div>
        <a mat-flat-button routerLink="/settings/whatsapp">Set up WhatsApp</a>
      </div>
    }

    <div class="ai-brief">
      <div class="spark"><mat-icon class="fill">auto_awesome</mat-icon></div>
      <div class="grow"><h2>AI daily brief</h2>
        <ul>
          <li><b>{{ d().hot.length }} hot leads</b> are open — {{ d().hotUncalled }} haven’t had counselling yet. Call them first.</li>
          <li><b>{{ d().overdue.length }} follow-ups are overdue</b>@if (d().overdue[0]?.lead) { — oldest: {{ d().overdue[0].lead.parent }} ({{ d().overdue[0].lead.program }})}.</li>
          <li><b>{{ d().unread }} parents</b> are waiting for a reply on WhatsApp.</li>
          @if (d().best) { <li><b>{{ d().best.source }}</b> converts best at {{ pct(d().best.conv) }} — consider pushing more budget or a referral campaign there.</li> }
        </ul>
      </div>
      <a mat-button routerLink="/ai-qualifier" class="hide-sm"><mat-icon>tune</mat-icon>Tune AI</a>
    </div>

    <div class="kpis">
      <k3-kpi icon="person_add" label="Enquiries · 30 days" [value]="num(k().leads)" [delta]="(dl() >= 0 ? '▲ ' : '▼ ') + pct(abs(dl())) + ' vs prev. 30 days'" [cls]="dl() >= 0 ? 'up' : 'down'" />
      <k3-kpi icon="local_fire_department" label="Hot leads" [value]="num(k().hot)" delta="AI-qualified, score ≥ 70" />
      <k3-kpi icon="school" label="Admissions" [value]="num(k().admitted)" [delta]="'Conversion ' + pct(k().conversion)" />
      <k3-kpi icon="mark_chat_read" label="WhatsApp reply rate" [value]="pct(k().replyRate)" delta="Parents replying to messages" />
      <k3-kpi icon="bolt" label="First response" [value]="k().botFirstResponseSec + 's'" delta="Instant WhatsApp auto-reply" />
    </div>

    <div class="grid g-21" style="margin-bottom:16px">
      <div class="card"><div class="card-head"><div><h3>Enquiries — last 30 days</h3><div class="card-sub">New leads per day, with AI-qualified hot leads</div></div></div>
        <k3-legend [items]="[{ name: 'All enquiries', color: '#2a78d6' }, { name: 'Hot', color: T.hot.color }]" />
        <k3-chart kind="line" [opts]="line()" /></div>
      <div class="card"><div class="card-head"><div><h3>Pipeline</h3><div class="card-sub">All leads by current stage</div></div><a mat-button routerLink="/leads" [queryParams]="{ view: 'board' }">Board</a></div>
        @for (x of d().stages; track x.s) {
          <div class="hbar" style="grid-template-columns:118px 1fr 40px"><k3-stage [stage]="x.s" /><div class="track"><i [style.width.%]="x.n / d().maxS * 100" [style.background]="SC[x.s]"></i></div><span class="v">{{ x.n }}</span></div>
        }
      </div>
    </div>

    <div class="grid g-2">
      <div class="card"><div class="card-head"><div><h3><mat-icon class="fill ic-inline" style="color:var(--k3-hot)">local_fire_department</mat-icon>Hot leads — call now</h3><div class="card-sub">Highest AI scores among open leads</div></div>
        <a mat-button routerLink="/leads" [queryParams]="{ temp: 'hot' }">View all</a></div>
        @for (l of d().hot.slice(0, 6); track l.id) {
          <div class="list-item" (click)="open(l.id)">
            <k3-avatar [name]="l.parent" size="md" />
            <div class="meta"><div class="name">{{ l.parent }} <span class="muted small">for {{ (l.student || '').split(' ')[0] }}</span></div><div class="line2">{{ l.program }} · {{ l.source }}</div></div>
            <k3-temp temp="hot" [score]="l.ai.score" />
            <button mat-icon-button (click)="$event.stopPropagation(); open(l.id, 'whatsapp')" aria-label="WhatsApp"><mat-icon>chat</mat-icon></button>
          </div>
        } @empty { <div class="empty">No hot leads right now</div> }
      </div>
      <div class="card"><div class="card-head"><div><h3><mat-icon class="ic-inline">event_upcoming</mat-icon>Today’s follow-ups</h3><div class="card-sub">{{ d().today.length }} due today or overdue</div></div><a mat-button routerLink="/followups">All tasks</a></div>
        @for (f of d().today.slice(0, 6); track f.id) {
          <div class="list-item" (click)="open(f.leadId)">
            <div class="tico" [style.background]="FU[f.type]?.bg" [style.color]="FU[f.type]?.fg"><mat-icon>{{ FU[f.type]?.icon }}</mat-icon></div>
            <div class="meta"><div class="name">{{ f.note }}</div><div class="line2">{{ f.lead?.parent }} · {{ f.lead?.program }}</div></div>
            <span class="small nowrap" [class.over]="due(f.due).over" [class.muted]="!due(f.due).over">{{ due(f.due).text }}</span>
          </div>
        } @empty { <div class="empty">All caught up 🎉</div> }
      </div>
    </div>
  </div>
  }`,
})
export class HomePage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private router = inject(Router); private nav = inject(LeadNav);
  d = signal<any>(null); demo = (window as any).API_CONFIG?.mode === 'demo';
  T = TEMP; SC = STAGE_COLOR; FU = FU_TYPE; pct = pct; num = num; abs = Math.abs; due = dueLabel;
  greet = (h => h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening')(new Date().getHours());
  firstName = computed(() => String(this.s.me()?.user?.name || this.s.meta()?.user?.name || 'there').split(' ')[0]);
  k = computed(() => this.d().rep.kpis);
  dl = computed(() => { const k = this.k(); return k.leadsPrev ? (k.leads - k.leadsPrev) / k.leadsPrev : 0; });
  line = computed(() => { const s = this.d().rep.series; return { labels: s.map((x: any) => x.date), series: [{ name: 'All enquiries', color: '#2a78d6', values: s.map((x: any) => x.total) }, { name: 'Hot', color: TEMP['hot'].color, values: s.map((x: any) => x.hot) }], area: true, height: 230, fmtLabel: (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }; });
  constructor() { this.load(); }
  async load() {
    try {
      const [rep, leads, fus, convs] = await Promise.all([this.api.report('30d'), this.api.leads(), this.api.followups(), this.api.conversations()]);
      const open = leads.filter(l => !['admitted', 'lost'].includes(l.stage));
      const hot = open.filter(l => l.ai?.temp === 'hot').sort((a, b) => b.ai.score - a.ai.score);
      const pending = fus.filter(f => !f.done); const now = new Date();
      const overdue = pending.filter(f => new Date(f.due) < now && !isToday(f.due)).sort((a, b) => a.due.localeCompare(b.due));
      const today = pending.filter(f => new Date(f.due) < now || isToday(f.due)).sort((a, b) => a.due.localeCompare(b.due));
      const stages = STAGES.map(s => ({ s, n: leads.filter(l => l.stage === s).length }));
      const best = (rep.bySource || []).filter((x: any) => x.leads >= 3).map((x: any) => ({ source: x.source, conv: x.admitted / x.leads })).sort((a: any, b: any) => b.conv - a.conv)[0];
      this.d.set({ rep, hot, hotUncalled: hot.filter(l => ['new', 'contacted'].includes(l.stage)).length, overdue, today, stages, maxS: Math.max(1, ...stages.map(x => x.n)), best, unread: convs.filter(c => c.unread).length });
    } catch (e) { this.ui.error(e); }
  }
  async open(id: string, tab?: string) { if (await this.nav.open(id, tab)) this.load(); }
  newLead() { this.ui.open(NewLeadDialog, null, { width: '640px' }).afterClosed().subscribe(l => { if (l) { this.load(); } }); }
}
