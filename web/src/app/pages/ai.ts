import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { pct } from '../core/util';
import { environment } from '../../environments/environment';
import { TempMix, TempPill } from '../shared/bits';

const W: [string, string, string, number][] = [
  ['intent', 'Intent signals', 'Keywords like fees, visit, seats, documents, apply — minus hesitation words', 25], ['engagement', 'Engagement', 'Number of WhatsApp replies from the parent', 20],
  ['responsiveness', 'Response speed', 'How fast the parent replies on average', 15], ['source', 'Source quality', 'Walk-ins & referrals rank above paid social', 15],
  ['stage', 'Stage progress', 'Counselling → visit → application', 15], ['recency', 'Recency', 'Days since last activity', 10],
];

@Component({
  selector: 'k3-ai',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatSliderModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule, MatChipsModule, MatProgressBarModule, TempMix, TempPill],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>AI Qualifier</h1><div class="sub">Automatically classifies every enquiry as Hot, Warm or Cold — and explains why</div></div>
      <div class="grow"></div>@if (admin()) {<button mat-flat-button (click)="save()" [disabled]="busy() || !cfg()"><mat-icon>auto_awesome</mat-icon>Save & re-qualify all</button>}
    </div>
    @if (!cfg()) { <mat-progress-bar mode="indeterminate" /> } @else {
    <div class="grid g-21">
      <div class="col" style="gap:16px;min-width:0">
        <div class="card"><div class="card-head"><div><h3>Scoring weights</h3><div class="card-sub">How much each signal counts toward the 0–100 lead score</div></div></div>
          @for (w of weights; track w[0]) {
            <div class="wrow"><div class="grow" style="min-width:0"><div class="t">{{ w[1] }} <span class="small muted">· up to {{ w[3] }} pts</span></div><div class="small muted">{{ w[2] }}</div></div>
              <mat-slider min="0" max="2" step="0.1" [disabled]="!admin()"><input matSliderThumb [(ngModel)]="cfg().weights[w[0]]" [attr.aria-label]="w[1]"></mat-slider><b class="tnum val">{{ (+cfg().weights[w[0]]).toFixed(1) }}×</b></div>
          }
        </div>
        <div class="card"><div class="card-head"><div><h3>Temperature thresholds</h3><div class="card-sub">Score cut-offs for each bucket</div></div></div>
          <div class="wrow"><k3-temp temp="hot" /><mat-slider min="50" max="95" step="1" class="grow" [disabled]="!admin()"><input matSliderThumb [(ngModel)]="cfg().thresholds.hot" (ngModelChange)="fixTh()" aria-label="Hot threshold"></mat-slider><b class="tnum val">≥{{ cfg().thresholds.hot }}</b></div>
          <div class="wrow"><k3-temp temp="warm" /><mat-slider min="15" max="65" step="1" class="grow" [disabled]="!admin()"><input matSliderThumb [(ngModel)]="cfg().thresholds.warm" (ngModelChange)="fixTh()" aria-label="Warm threshold"></mat-slider><b class="tnum val">≥{{ cfg().thresholds.warm }}</b></div>
          <div class="small muted">Anything below the warm threshold is <b>Cold</b>.</div>
        </div>
        <div class="card"><div class="card-head"><div><h3>Automation</h3></div></div>
          <div class="trow"><div class="grow"><div class="t">Re-qualify on every WhatsApp reply</div><div class="small muted">Parent replies are analysed instantly and the lead moves between sequences</div></div><mat-slide-toggle [(ngModel)]="cfg().autoQualifyOnReply" [disabled]="!admin()" aria-label="Re-qualify on reply" /></div>
          <div class="trow"><div class="grow"><div class="t">Hot lead fast-track</div><div class="small muted">Alert the counsellor & create a call task within 1 hour</div></div><mat-slide-toggle [(ngModel)]="cfg().autoAssignHot" [disabled]="!admin()" aria-label="Hot lead fast-track" /></div>
        </div>
      </div>
      <div class="col" style="gap:16px;min-width:0">
        <div class="card"><div class="card-head"><div><h3>Current distribution</h3><div class="card-sub">{{ total() }} leads</div></div></div><k3-temp-mix [mix]="mix()" /></div>
        <div class="card"><div class="card-head"><div><h3>Test the AI</h3><div class="card-sub">Paste a parent’s WhatsApp message</div></div></div>
          <mat-form-field class="full" subscriptSizing="dynamic"><mat-label>Message</mat-label><textarea matInput rows="3" [(ngModel)]="text"></textarea></mat-form-field>
          <mat-chip-set style="margin:8px 0">@for (x of examples; track x) {<mat-chip (click)="text = x; test()">{{ x }}</mat-chip>}</mat-chip-set>
          <button mat-stroked-button (click)="test()" [disabled]="testing()"><mat-icon>auto_awesome</mat-icon>Analyse</button>
          @if (testing()) { <mat-progress-bar mode="indeterminate" style="margin-top:12px" /> }
          @if (out(); as o) {
            <div class="kv" style="grid-template-columns:110px 1fr;margin-top:14px"><span class="k">Intent</span><b>{{ o.intent }}</b><span class="k">Signal</span><k3-temp [temp]="o.signal" /><span class="k">Sentiment</span><span>{{ o.sentiment }}</span><span class="k">Confidence</span><span class="tnum">{{ pct(o.confidence) }}</span></div>
            <div class="banner info" style="margin-top:12px"><mat-icon>reply</mat-icon><div><div class="small muted">Suggested WhatsApp reply</div>{{ (o.suggestedReply || '').replace('{{program}}', 'Class 11 – Science') }}</div></div>
          }
        </div>
        @if (!demo) { <div class="banner info small"><mat-icon>info</mat-icon><div>Scoring is a transparent rules engine — counsellors can always see <i>why</i> a lead is hot. Set <code>ANTHROPIC_API_KEY</code> on the server to add Claude-powered intent detection and reply drafting for free-text messages.</div></div> }
      </div>
    </div>
    }
  </div>`,
  styles: [`.wrow{display:flex;align-items:center;gap:12px;padding:6px 0} .wrow mat-slider{width:180px;flex:none} .wrow .grow mat-slider,.wrow mat-slider.grow{flex:1;width:auto}
    .val{width:44px;text-align:right} .t{font:var(--mat-sys-title-small)} .trow{display:flex;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--mat-sys-outline-variant)} .trow:first-of-type{border-top:0}
    @media (max-width:600px){.wrow{flex-wrap:wrap}.wrow mat-slider{flex:1;width:auto}}`],
})
export class AiPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui);
  demo = environment.demo; weights = W; pct = pct;
  cfg = signal<any>(null); leads = signal<any[]>([]); busy = signal(false); testing = signal(false); out = signal<any>(null);
  admin = computed(() => this.demo || this.s.role() === 'admin');
  mix = computed(() => { const t: any = { hot: 0, warm: 0, cold: 0 }; this.leads().forEach(l => t[l.ai?.temp] = (t[l.ai?.temp] || 0) + 1); return t; });
  total = computed(() => this.leads().length);
  text = 'Hi, what is the fee for Class 11 Science? Can we visit the campus this Saturday?';
  examples = ['Are seats still available for Nursery?', 'Fees seem too high, maybe next year', 'Do you have a bus from Behala?'];
  constructor() { Promise.all([this.api.aiConfig(), this.api.leads()]).then(([c, l]) => { this.cfg.set(c); this.leads.set(l); }).catch(e => this.ui.error(e)); }
  fixTh() { const t = this.cfg().thresholds; if (t.warm >= t.hot) t.warm = t.hot - 5; }
  async test() { this.testing.set(true); this.out.set(null); try { this.out.set(await this.api.classify(this.text)); } catch (e) { this.ui.error(e); } this.testing.set(false); }
  async save() {
    this.busy.set(true);
    try { await this.api.setAiConfig(this.cfg()); const r = await this.api.qualifyAll(); this.leads.set(await this.api.leads()); this.ui.toast(`Saved · ${r.changed} leads changed temperature → ${r.hot} hot, ${r.warm} warm, ${r.cold} cold`); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}
