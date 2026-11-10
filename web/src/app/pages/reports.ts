import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Session } from '../core/session.service';
import { Api } from '../core/api.service';
import { Ui } from '../core/ui.service';
import { TEMP, inr, num, pct } from '../core/util';
import { Chart, Kpi, Legend, TempMix, TempPill } from '../shared/bits';

@Component({
  selector: 'k3-reports',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatButtonToggleModule, MatProgressBarModule, Chart, Kpi, Legend, TempMix, TempPill],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Reports</h1><div class="sub">Admissions performance · {{ s.meta().institution?.name }}</div></div>
      <div class="grow"></div>
      <mat-button-toggle-group [value]="range()" (change)="setRange($event.value)" hideSingleSelectionIndicator aria-label="Range">
        <mat-button-toggle value="7d">7 days</mat-button-toggle><mat-button-toggle value="30d">30 days</mat-button-toggle><mat-button-toggle value="90d">90 days</mat-button-toggle>
      </mat-button-toggle-group>
      <button mat-stroked-button (click)="csv()" [disabled]="!r()"><mat-icon>download</mat-icon>CSV</button>
    </div>
    @if (!r()) { <mat-progress-bar mode="indeterminate" /> } @else {
      <div class="kpis">
        <k3-kpi icon="person_add" label="Enquiries" [value]="num(k().leads)" [delta]="delta(k().leads, k().leadsPrev)" [cls]="k().leads >= k().leadsPrev ? 'up' : 'down'" />
        <k3-kpi icon="school" label="Admissions" [value]="num(k().admitted)" [delta]="delta(k().admitted, k().admittedPrev)" [cls]="k().admitted >= k().admittedPrev ? 'up' : 'down'" />
        <k3-kpi icon="percent" label="Lead → admission" [value]="pct(k().conversion)" delta="Conversion rate" />
        <k3-kpi icon="currency_rupee" label="Cost per admission" [value]="paidAdm() ? inr(k().spend / paidAdm()) : '—'" [delta]="'Ad spend ' + inr(k().spend)" />
        <k3-kpi icon="mark_chat_read" label="WhatsApp reply rate" [value]="pct(k().replyRate)" [delta]="num(r().whatsapp.outbound) + ' messages sent'" />
      </div>
      <div class="grid g-21" style="margin-bottom:16px">
        <div class="card"><div class="card-head"><div><h3>Enquiries over time</h3><div class="card-sub">Daily new leads and the share the AI qualified as hot</div></div></div>
          <k3-legend [items]="[{ name: 'All enquiries', color: '#2a78d6' }, { name: 'Hot', color: T.hot.color }]" /><k3-chart kind="line" [opts]="line()" /></div>
        <div class="card"><div class="card-head"><div><h3>Lead temperature</h3><div class="card-sub">AI qualification of leads in this period</div></div></div>
          <k3-temp-mix [mix]="r().temp" />
          <div class="small muted" style="margin-top:6px">Thresholds are editable in AI Qualifier.</div>
          <div style="margin-top:12px">@for (t of ['hot', 'warm', 'cold']; track t) {<div class="row tline"><k3-temp [temp]="t" /><span class="grow small muted">{{ t === 'hot' ? 'Call within 1 hour' : t === 'warm' ? 'Weekly nurture drip' : 'Monthly re-engagement' }}</span><b class="tnum">{{ r().temp[t] }}</b></div>}</div></div>
      </div>
      <div class="grid g-2" style="margin-bottom:16px">
        <div class="card"><div class="card-head"><div><h3>Admissions funnel</h3><div class="card-sub">Leads reaching each stage · % of enquiries</div></div></div>
          @for (f of r().funnel; track f.stage; let i = $index) {<div class="hbar" style="grid-template-columns:110px 1fr 90px"><span>{{ f.label }}</span><div class="track"><i [style.width.%]="f.count / f0() * 100" [style.opacity]="1 - i * 0.12"></i></div><span class="v">{{ f.count }} <span class="small muted">{{ pct(f.count / f0()) }}</span></span></div>}</div>
        <div class="card"><div class="card-head"><div><h3>Leads by source</h3><div class="card-sub">Enquiries vs admissions per channel</div></div></div>
          <k3-legend [items]="[{ name: 'Leads', color: '#2a78d6' }, { name: 'Admitted', color: '#eb6834' }]" /><k3-chart kind="bars" [opts]="bars()" /></div>
      </div>
      <div class="card" style="margin-bottom:16px"><div class="card-head"><div><h3>Source ROI</h3><div class="card-sub">Spend (Settings → Messaging & spend) is prorated to the selected period</div></div></div>
        <div class="tbl-wrap flat"><table class="simple"><thead><tr><th>Source</th><th class="num">Leads</th><th class="num">Hot</th><th class="num">Admitted</th><th class="num">Conversion</th><th class="num">Spend</th><th class="num">Cost / lead</th><th class="num">Cost / admission</th></tr></thead><tbody>
          @for (x of r().bySource; track x.source) {<tr><td>{{ x.source }}</td><td class="num">{{ x.leads }}</td><td class="num">{{ x.hot }}</td><td class="num">{{ x.admitted }}</td><td class="num">{{ x.leads ? pct(x.admitted / x.leads) : '—' }}</td><td class="num">{{ x.spend ? inr(x.spend) : '—' }}</td><td class="num">{{ x.cpl ? inr(x.cpl) : '—' }}</td><td class="num">{{ x.cpa ? inr(x.cpa) : x.spend ? '—' : 'Organic' }}</td></tr>}
        </tbody></table></div></div>
      <div class="grid g-12" style="margin-bottom:16px">
        <div class="card"><div class="card-head"><div><h3>Demand by program</h3><div class="card-sub">Enquiries per class</div></div></div>
          @for (p of programs(); track p.program) {<div class="hbar" style="grid-template-columns:140px 1fr 36px"><span class="small ellipsis">{{ p.program }}</span><div class="track" style="height:14px"><i [style.width.%]="p.leads / maxP() * 100"></i></div><span class="v small">{{ p.leads }}</span></div>}</div>
        <div class="card"><div class="card-head"><div><h3>Counsellor performance</h3><div class="card-sub">Leads assigned in this period</div></div></div>
          <div class="tbl-wrap flat"><table class="simple"><thead><tr><th>Counsellor</th><th class="num">Leads</th><th class="num">Hot</th><th class="num">Visits</th><th class="num">Admitted</th><th class="num">Conv.</th><th class="num">First reply</th><th class="num">Overdue</th></tr></thead><tbody>
            @for (c of r().counsellors; track c.id) {<tr><td><div class="row nowrap"><span class="avatar sm" [style.background]="c.color">{{ c.initials }}</span>{{ c.name }}</div></td><td class="num">{{ c.leads }}</td><td class="num">{{ c.hot }}</td><td class="num">{{ c.visits }}</td><td class="num">{{ c.admitted }}</td><td class="num">{{ pct(c.conv) }}</td><td class="num">{{ c.firstResponse != null ? c.firstResponse + ' min' : '—' }}</td><td class="num" [class.over]="c.overdue">{{ c.overdue }}</td></tr>}
          </tbody></table></div></div>
      </div>
      <div class="card"><div class="card-head"><div><h3>WhatsApp broadcast performance</h3><div class="card-sub">Completed campaigns</div></div><a mat-button routerLink="/broadcasts">All broadcasts</a></div>
        <div class="tbl-wrap flat"><table class="simple"><thead><tr><th>Campaign</th><th class="num">Sent</th><th class="num">Delivered</th><th class="num">Read</th><th class="num">Replied</th><th class="num">Clicked</th><th class="num">Failed</th></tr></thead><tbody>
          @for (b of r().whatsapp.broadcasts; track $index) {<tr><td>{{ b.name }}</td><td class="num">{{ num(b.sent) }}</td><td class="num">{{ pct(b.delivered / (b.sent || 1)) }}</td><td class="num">{{ pct(b.read / (b.delivered || 1)) }}</td><td class="num">{{ pct(b.replied / (b.delivered || 1)) }}</td><td class="num">{{ pct(b.clicked / (b.delivered || 1)) }}</td><td class="num">{{ num(b.failed) }}</td></tr>}
          @empty {<tr><td colspan="7" class="muted">No completed broadcasts in this period</td></tr>}
        </tbody></table></div></div>
    }
  </div>`,
  styles: [`.tline{padding:8px 0;border-top:1px solid var(--mat-sys-outline-variant)} .hbar .track i{background:#2a78d6}`],
})
export class ReportsPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui);
  T = TEMP; num = num; pct = pct; inr = inr;
  range = signal('30d'); r = signal<any>(null);
  k = computed(() => this.r().kpis);
  paidAdm = computed(() => this.r().bySource.filter((x: any) => x.spend).reduce((a: number, x: any) => a + x.admitted, 0));
  f0 = computed(() => this.r().funnel[0]?.count || 1);
  programs = computed(() => this.r().byProgram.slice().sort((a: any, b: any) => b.leads - a.leads));
  maxP = computed(() => Math.max(1, ...this.r().byProgram.map((p: any) => p.leads)));
  line = computed(() => { const s = this.r().series; return { labels: s.map((x: any) => x.date), series: [{ name: 'All enquiries', color: '#2a78d6', values: s.map((x: any) => x.total) }, { name: 'Hot', color: TEMP['hot'].color, values: s.map((x: any) => x.hot) }], area: true, height: 250, fmtLabel: (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }; });
  bars = computed(() => { const b = this.r().bySource; return { categories: b.map((x: any) => x.source.replace(' / Seminar', '')), series: [{ name: 'Leads', color: '#2a78d6', values: b.map((x: any) => x.leads) }, { name: 'Admitted', color: '#eb6834', values: b.map((x: any) => x.admitted) }], height: 250 }; });
  delta = (a: number, b: number) => { const d = b ? (a - b) / b : 0; return `${d >= 0 ? '▲' : '▼'} ${pct(Math.abs(d))} vs previous`; };
  constructor() { this.load(); }
  setRange(v: string) { this.range.set(v); this.r.set(null); this.load(); }
  async load() { try { this.r.set(await this.api.report(this.range())); } catch (e) { this.ui.error(e); } }
  csv() {
    const r = this.r(); const rows: any[][] = [['Source', 'Leads', 'Hot', 'Admitted', 'Spend', 'CostPerLead', 'CostPerAdmission'], ...r.bySource.map((s: any) => [s.source, s.leads, s.hot, s.admitted, s.spend, s.cpl, s.cpa]), [], ['Counsellor', 'Leads', 'Hot', 'Visits', 'Admitted', 'Conversion', 'Overdue'], ...r.counsellors.map((c: any) => [c.name, c.leads, c.hot, c.visits, c.admitted, pct(c.conv), c.overdue]), [], ['Date', 'Enquiries', 'Hot'], ...r.series.map((x: any) => [x.date.slice(0, 10), x.total, x.hot])];
    const csv = rows.map(x => x.map(v => /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `k3-admissions-report-${this.range()}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    this.ui.toast('Report downloaded as CSV');
  }
}
