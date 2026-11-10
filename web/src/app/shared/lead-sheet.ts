/* Lead detail — M3 side sheet (full-screen on phones) */
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { STAGES, STAGE_LABEL, TEMP, dueLabel, fmtDate, rel } from '../core/util';
import { Avatar, StageTag, TempPill } from './bits';
import { Chat } from './chat';
import { CallDialog, CustomFieldsDialog, FollowupDialog, PickDialog } from './dialogs';

const FACTOR_LABELS: Record<string, string> = { intent: 'Intent signals', engagement: 'Engagement', responsiveness: 'Response speed', source: 'Source quality', stage: 'Stage progress', recency: 'Recency' };

@Component({
  selector: 'k3-lead-sheet',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatTabsModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatTooltipModule, Avatar, StageTag, TempPill, Chat],
  template: `
  @if (!l()) { <div class="center-load"><mat-spinner diameter="36" /></div> }
  @else {
    <div class="sh-h">
      <k3-avatar [name]="l().student || l().parent" size="lg" />
      <div class="grow" style="min-width:0">
        <h2>{{ l().student || l().parent }}</h2>
        <div class="muted ellipsis">{{ l().parent }} · {{ l().phone }}</div>
        <div class="row wrap" style="margin-top:8px"><k3-temp [temp]="l().ai.temp" [score]="l().ai.score" /><k3-stage [stage]="l().stage" /><span class="pill p-grey">{{ l().program }}</span>@for (t of l().tags || []; track t) {<span class="pill p-blue">{{ t }}</span>}</div>
      </div>
      <button mat-icon-button mat-dialog-close aria-label="Close"><mat-icon>close</mat-icon></button>
    </div>
    <div class="sh-actions">
      <button mat-flat-button class="wa" (click)="tab.set(1)"><mat-icon>chat</mat-icon>WhatsApp</button>
      <button mat-stroked-button (click)="call()"><mat-icon>call</mat-icon>Call</button>
      <button mat-stroked-button (click)="followup()"><mat-icon>event</mat-icon>Follow-up</button>
      <button mat-stroked-button (click)="enroll()"><mat-icon>conversion_path</mat-icon>Enroll</button>
      <button mat-icon-button (click)="requalify()" [disabled]="busy()" matTooltip="Re-run AI qualification" aria-label="Re-qualify"><mat-icon [class.spin]="busy()">auto_awesome</mat-icon></button>
    </div>
    <mat-tab-group [selectedIndex]="tab()" (selectedIndexChange)="tab.set($event)" mat-stretch-tabs="false" class="sh-tabs" animationDuration="150ms">
      <mat-tab label="Overview">
        <div class="sh-body">
          <div class="ai-card">
            <div class="row" style="gap:14px">
              <div class="ring"><svg width="76" height="76" viewBox="0 0 76 76"><circle cx="38" cy="38" r="32" stroke="#dfe3eb" stroke-width="7" fill="none"/><circle cx="38" cy="38" r="32" [attr.stroke]="T[l().ai.temp].color" stroke-width="7" fill="none" stroke-linecap="round" [attr.stroke-dasharray]="dash()" transform="rotate(-90 38 38)"/></svg><div class="v tnum">{{ l().ai.score }}</div></div>
              <div class="grow"><div class="small muted row"><mat-icon class="sm">auto_awesome</mat-icon>AI qualification</div>
                <div style="font:var(--mat-sys-title-large);margin:2px 0">{{ T[l().ai.temp].label }} lead</div>
                <div class="small muted">Updated {{ rel(l().ai.updatedAt) }}@if (l().ai.model) { · {{ l().ai.model }}}</div></div>
            </div>
            <div style="margin-top:12px">@for (k of factorKeys(); track k) {<div class="factor"><span>{{ FL[k] }}</span><div class="bar"><i [style.width.%]="l().ai.factors[k] / l().ai.max[k] * 100"></i></div><span class="tnum muted">{{ l().ai.factors[k] }}/{{ l().ai.max[k] }}</span></div>}</div>
            <ul class="reasons">@for (r of l().ai.reasons || []; track $index) {<li><mat-icon class="fill" [style.color]="r.good ? 'var(--k3-ok)' : 'var(--k3-warm)'">{{ r.good ? 'check_circle' : 'error' }}</mat-icon><span>{{ r.text }}</span></li>}</ul>
            @if (l().ai.nextAction) {<div class="nba"><mat-icon class="fill">tips_and_updates</mat-icon><div><div class="small muted">Next best action</div><b>{{ l().ai.nextAction }}</b></div></div>}
          </div>
          <div class="kv">
            <span class="k">Stage</span>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dense"><mat-select [ngModel]="l().stage" (ngModelChange)="patch({ stage: $event }, 'Stage updated → ' + SL[$event])">@for (s of stages; track s) {<mat-option [value]="s">{{ SL[s] }}</mat-option>}</mat-select></mat-form-field>
            <span class="k">Counsellor</span>
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dense"><mat-select [ngModel]="l().counsellorId" (ngModelChange)="patch({ counsellorId: $event }, 'Counsellor reassigned')">@for (c of s.meta().counsellors; track c.id) {<mat-option [value]="c.id">{{ c.name }}</mat-option>}</mat-select></mat-form-field>
            <span class="k">Program</span><span>{{ l().program }}</span>
            <span class="k">Source</span><span>{{ l().source }}@if (l().campaign) { <span class="muted small">· {{ l().campaign }}</span>}</span>
            <span class="k">Area</span><span>{{ l().area || '—' }}</span>
            <span class="k">Email</span><span class="ellipsis">{{ l().email || '—' }}</span>
            <span class="k">WhatsApp</span><span>@if (l().optedOut) {<span class="pill p-bad">Opted out</span>} @else if (l().windowOpen === false) {<span class="pill p-grey">24h window closed · templates only</span>} @else {<span class="pill p-ok">Chat window open</span>}</span>
            <span class="k">Enquired</span><span>{{ fmt(l().createdAt) }}</span>
            <span class="k">Next follow-up</span><span>{{ due(l().nextFollowUp).text }}</span>
            <span class="k">Sequences</span><span class="row wrap">@for (q of l().sequences || []; track q) {<span class="pill p-blue">{{ (l().sequenceNames || {})[q] || 'Sequence' }}</span>} @empty {—}</span>
          </div>
          <div class="card flat" style="margin-top:16px;padding:14px 16px">
            <div class="row"><b class="grow">Custom fields</b><button mat-button (click)="editCustom()"><mat-icon>edit</mat-icon>{{ customKeys().length ? 'Edit' : 'Add' }}</button></div>
            @if (customKeys().length) {<div class="kv" style="margin-top:6px">@for (k of customKeys(); track k) {<span class="k">{{ k.replaceAll('_', ' ') }}</span><span>{{ l().custom[k] }}</span>}</div>}
            @else {<div class="small muted">e.g. roll number, fee balance, exam date — usable as template variables</div>}
          </div>
        </div>
      </mat-tab>
      <mat-tab [label]="'WhatsApp' + (l().unread ? ' •' : '')">
        <ng-template matTabContent><div class="sh-chat"><k3-chat [lead]="l()" [header]="false" /></div></ng-template>
      </mat-tab>
      <mat-tab label="Timeline">
        <div class="sh-body"><ul class="timeline">@for (t of timeline(); track $index) {<li><div class="ic"><mat-icon>{{ t.icon }}</mat-icon></div><div><div>{{ t.text }}</div><div class="small muted">{{ fmt(t.at) }}</div></div></li>}</ul></div>
      </mat-tab>
      <mat-tab [label]="'Notes (' + (l().notes?.length || 0) + ')'">
        <div class="sh-body">
          <mat-form-field appearance="outline" class="full"><mat-label>Add a note for the admissions team</mat-label><textarea matInput rows="3" [(ngModel)]="note"></textarea></mat-form-field>
          <div class="row" style="justify-content:flex-end;margin:-6px 0 16px"><button mat-flat-button (click)="addNote()" [disabled]="!note.trim()"><mat-icon>add</mat-icon>Add note</button></div>
          @for (n of l().notes; track n.id) {<div class="card flat" style="margin-bottom:8px;padding:12px 14px"><div style="white-space:pre-wrap">{{ n.text }}</div><div class="small muted" style="margin-top:4px">{{ n.by }} · {{ rel(n.at) }}</div></div>}
          @empty {<div class="empty">No notes yet</div>}
        </div>
      </mat-tab>
    </mat-tab-group>
  }`,
  styles: [`:host{display:flex;flex-direction:column;height:100%;background:var(--mat-sys-surface-container-low)}
    .center-load{display:grid;place-items:center;flex:1}
    .sh-h{display:flex;gap:14px;align-items:flex-start;padding:20px 16px 8px 24px} .sh-h h2{margin:0;font:var(--mat-sys-headline-small)}
    .sh-actions{display:flex;gap:8px;padding:8px 24px 12px;overflow-x:auto;scrollbar-width:none} .sh-actions button{flex:none}
    .wa{background:var(--k3-wa)!important;color:#fff!important}
    .sh-tabs{flex:1;min-height:0} :host ::ng-deep .sh-tabs .mat-mdc-tab-body-wrapper{flex:1;min-height:0}
    .sh-body{padding:16px 24px 32px} .sh-chat{height:100%;min-height:420px;display:flex;flex-direction:column}
    :host ::ng-deep .sh-tabs .mat-mdc-tab-body-content{height:100%}
    .ring{position:relative;width:76px;height:76px;flex:none} .ring .v{position:absolute;inset:0;display:grid;place-items:center;font:var(--mat-sys-title-large)}
    .reasons{list-style:none;padding:0;margin:10px 0 0} .reasons li{display:flex;gap:8px;align-items:flex-start;font:var(--mat-sys-body-medium);margin:4px 0} .reasons mat-icon{font-size:18px;width:18px;height:18px;flex:none;margin-top:1px}
    .nba{display:flex;gap:10px;align-items:center;margin-top:12px;background:var(--mat-sys-surface);border-radius:12px;padding:10px 12px} .nba mat-icon{color:var(--k3-warm)}
    .dense{width:100%;max-width:260px}
    @media (max-width:600px){.sh-h{padding:16px 8px 4px 16px}.sh-actions{padding:8px 16px 10px}.sh-body{padding:14px 16px 28px}}`],
})
export class LeadSheet {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  data = inject<any>(MAT_DIALOG_DATA);
  l = signal<any>(null); tab = signal(this.data.tab === 'whatsapp' ? 1 : 0); busy = signal(false); changed = false; note = '';
  T = TEMP; SL = STAGE_LABEL; FL = FACTOR_LABELS; stages = STAGES; rel = rel; due = dueLabel; fmt = (a: string) => fmtDate(a, { dateStyle: 'medium', timeStyle: 'short' });
  dash = computed(() => { const C = 2 * Math.PI * 32; return `${(this.l().ai.score / 100) * C} ${C}`; });
  factorKeys = computed(() => Object.keys(FACTOR_LABELS).filter(k => this.l()?.ai?.max?.[k]));
  customKeys = computed(() => Object.keys(this.l()?.custom || {}));
  timeline = computed(() => (this.l()?.timeline || []).slice().reverse());
  constructor() { this.load(); }
  async load() { try { this.l.set(await this.api.lead(this.data.id)); } catch (e) { this.ui.error(e); this.ref.close(); } }
  async patch(p: any, msg: string) { try { this.l.set(Object.assign({}, this.l(), await this.api.updateLead(this.l().id, p))); this.changed = true; this.ui.toast(msg); } catch (e) { this.ui.error(e); } }
  async addNote() { await this.api.addNote(this.l().id, this.note.trim()); this.note = ''; this.changed = true; await this.load(); }
  editCustom() { this.ui.open(CustomFieldsDialog, { custom: this.l().custom }).afterClosed().subscribe(c => c && this.patch({ custom: c }, 'Custom fields saved')); }
  followup() { this.ui.open(FollowupDialog, { lead: this.l() }).afterClosed().subscribe(f => { if (f) { this.changed = true; this.load(); } }); }
  call() {
    this.ui.open(CallDialog, this.l(), { width: '420px' }).afterClosed().subscribe(async (o: string) => {
      if (!o) return; const l = this.l();
      await this.api.addNote(l.id, 'Call logged: ' + o);
      if (o === 'Visit booked') await this.api.updateLead(l.id, { stage: 'visit' });
      else if (o.startsWith('Connected') && ['new', 'contacted'].includes(l.stage)) await this.api.updateLead(l.id, { stage: 'counselling' });
      this.changed = true; await this.load(); this.ui.toast('Call logged');
    });
  }
  async enroll() {
    const seqs = await this.api.sequences();
    this.ui.open(PickDialog, { title: 'Enroll in nurture sequence', label: 'Sequence', ok: 'Enroll', options: seqs.map(q => ({ value: q.id, label: `${q.name} — ${q.trigger}` })) }, { width: '460px' })
      .afterClosed().subscribe(async id => { if (!id) return; await this.api.enroll(id, [this.l().id]); this.changed = true; await this.load(); this.ui.toast('Enrolled'); });
  }
  async requalify() {
    this.busy.set(true);
    try { const r = await this.api.qualify(this.l().id); await this.load(); this.tab.set(0); this.changed = true; this.ui.toast(`AI score ${r.score} · ${TEMP[r.temp].label}${r.previous ? ` (was ${TEMP[r.previous].label})` : ' (unchanged)'}`); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}
