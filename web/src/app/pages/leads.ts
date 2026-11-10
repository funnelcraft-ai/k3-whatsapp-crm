import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { STAGES, STAGE_COLOR, STAGE_LABEL, TEMP, debounce, dueLabel, rel } from '../core/util';
import { Avatar, Owner, ScoreBar, StageTag, TempMix, TempPill } from '../shared/bits';
import { LeadNav } from '../shared/lead-nav';
import { PickDialog } from '../shared/dialogs';
import { ImportDialog, NewLeadDialog } from './leads-dialogs';
import { BroadcastDraft } from './broadcast-draft';

@Component({
  selector: 'k3-qualify-all', imports: [MatProgressBarModule, MatButtonModule, TempMix],
  template: `<h2 mat-dialog-title style="padding:24px 24px 0;margin:0;font:var(--mat-sys-headline-small)">AI qualification</h2>
  <div style="padding:16px 24px">
    @if (!r()) { <p><b>Analysing WhatsApp conversations…</b><br><span class="muted small">Scoring intent, engagement, response speed, source & stage for every lead</span></p><mat-progress-bar mode="indeterminate" /> }
    @else { <p>All leads re-scored. <b>{{ r().changed }}</b> lead{{ r().changed === 1 ? '' : 's' }} changed temperature.</p><k3-temp-mix [mix]="r()" /> }
  </div>`,
})
export class QualifyAllDialog { r = signal<any>(null); }

@Component({
  selector: 'k3-leads',
  imports: [FormsModule, DragDropModule, MatButtonModule, MatIconModule, MatTableModule, MatCheckboxModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatButtonToggleModule, MatProgressBarModule, MatMenuModule, MatTooltipModule, Avatar, Owner, ScoreBar, StageTag, TempPill],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Leads</h1><div class="sub">{{ summary() }}</div></div>
      <div class="grow"></div>
      <button mat-stroked-button (click)="importCsv()" class="hide-sm"><mat-icon>upload_file</mat-icon>Import CSV</button>
      <button mat-stroked-button (click)="qualifyAll()"><mat-icon>auto_awesome</mat-icon><span class="hide-xs">Run </span>AI qualification</button>
      <button mat-flat-button (click)="newLead()"><mat-icon>person_add</mat-icon>New enquiry</button>
      <button mat-icon-button [matMenuTriggerFor]="more" class="show-sm" aria-label="More"><mat-icon>more_vert</mat-icon></button>
      <mat-menu #more><button mat-menu-item (click)="importCsv()"><mat-icon>upload_file</mat-icon>Import CSV</button></mat-menu>
    </div>

    <div class="toolbar">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-f"><mat-icon matPrefix>search</mat-icon><input matInput placeholder="Search name, phone, program" [ngModel]="f().q" (ngModelChange)="search($event)"></mat-form-field>
      <mat-button-toggle-group [value]="f().temp" (change)="set('temp', $event.value)" hideSingleSelectionIndicator aria-label="Temperature">
        <mat-button-toggle value="">All</mat-button-toggle>
        @for (t of temps; track t) {<mat-button-toggle [value]="t"><mat-icon class="sm">{{ T[t].icon }}</mat-icon> {{ T[t].label }}</mat-button-toggle>}
      </mat-button-toggle-group>
      <div class="filters">
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-select [value]="f().stage" (selectionChange)="set('stage', $event.value)" placeholder="Any stage"><mat-option value="">Any stage</mat-option>@for (s of stages; track s) {<mat-option [value]="s">{{ SL[s] }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-select [value]="f().source" (selectionChange)="set('source', $event.value)" placeholder="Any source"><mat-option value="">Any source</mat-option>@for (s of s.meta().sources; track s) {<mat-option [value]="s">{{ s }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-select [value]="f().program" (selectionChange)="set('program', $event.value)" placeholder="Any program"><mat-option value="">Any program</mat-option>@for (s of s.meta().programs; track s) {<mat-option [value]="s">{{ s }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"><mat-select [value]="f().counsellor" (selectionChange)="set('counsellor', $event.value)" placeholder="Any counsellor"><mat-option value="">Any counsellor</mat-option>@for (c of s.meta().counsellors; track c.id) {<mat-option [value]="c.id">{{ c.name }}</mat-option>}</mat-select></mat-form-field>
      </div>
      <div class="grow"></div>
      <mat-button-toggle-group [value]="view()" (change)="setView($event.value)" hideSingleSelectionIndicator aria-label="View">
        <mat-button-toggle value="list"><mat-icon>table_rows</mat-icon></mat-button-toggle><mat-button-toggle value="board"><mat-icon>view_kanban</mat-icon></mat-button-toggle>
      </mat-button-toggle-group>
    </div>

    @if (sel().size) {
      <div class="bulkbar">
        <b>{{ sel().size }} selected</b><div class="grow"></div>
        <button mat-button (click)="bulkBroadcast()"><mat-icon>campaign</mat-icon><span class="hide-xs">Broadcast</span></button>
        <button mat-button (click)="bulkSeq()"><mat-icon>conversion_path</mat-icon><span class="hide-xs">Enroll</span></button>
        <button mat-button (click)="bulkAssign()"><mat-icon>person</mat-icon><span class="hide-xs">Assign</span></button>
        <button mat-button (click)="bulkStage()"><mat-icon>swap_horiz</mat-icon><span class="hide-xs">Stage</span></button>
        <button mat-icon-button (click)="clearSel()" aria-label="Clear selection"><mat-icon>close</mat-icon></button>
      </div>
    }

    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    @if (view() === 'board') {
      <div class="board" cdkDropListGroup>
        @for (st of stages; track st) {
          <div class="board-col" cdkDropList [cdkDropListData]="st" (cdkDropListDropped)="drop($event)">
            <div class="head"><i class="sw" [style.background]="SC[st]" style="border-radius:50%"></i>{{ SL[st] }}<span class="grow"></span><span class="pill p-grey">{{ byStage()[st].length }}</span></div>
            @for (l of byStage()[st]; track l.id) {
              <div class="kcard" cdkDrag [cdkDragData]="l" (click)="open(l.id)">
                <div class="row"><div class="n grow ellipsis">{{ l.student || l.parent }}</div><k3-owner [id]="l.counsellorId" /></div>
                <div class="p ellipsis">{{ l.program }} · {{ l.parent }}</div>
                <div class="row"><k3-temp [temp]="l.ai.temp" [score]="l.ai.score" /><span class="grow"></span><span class="small muted">{{ rel(l.lastActivityAt) }}</span></div>
              </div>
            }
          </div>
        }
      </div>
    } @else if (!loading() && !leads().length) {
      <div class="empty"><mat-icon>person_search</mat-icon><p>No leads match these filters</p></div>
    } @else if (mobile()) {
      <div class="mcards">
        @for (l of leads(); track l.id) {
          <div class="mcard" [class.selected]="sel().has(l.id)" (click)="open(l.id)">
            <mat-checkbox (click)="$event.stopPropagation()" [checked]="sel().has(l.id)" (change)="toggle(l.id)" aria-label="Select" />
            <div class="grow" style="min-width:0">
              <div class="row"><b class="ellipsis grow">{{ l.student || l.parent }}</b>@if (l.unread) {<span class="ubadge">{{ l.unread }}</span>}<k3-temp [temp]="l.ai.temp" [score]="l.ai.score" /></div>
              <div class="small muted ellipsis">{{ l.parent }} · {{ l.program }} · {{ l.source }}</div>
              <div class="row small" style="margin-top:6px"><k3-stage [stage]="l.stage" /><span class="grow"></span><span [class.over]="due(l.nextFollowUp).over" [class.muted]="!due(l.nextFollowUp).over">{{ due(l.nextFollowUp).text }}</span></div>
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="tbl-wrap">
        <table mat-table [dataSource]="leads()">
          <ng-container matColumnDef="sel"><th mat-header-cell *matHeaderCellDef><mat-checkbox [checked]="allSel()" [indeterminate]="sel().size > 0 && !allSel()" (change)="toggleAll()" aria-label="Select all" /></th>
            <td mat-cell *matCellDef="let l" (click)="$event.stopPropagation()"><mat-checkbox [checked]="sel().has(l.id)" (change)="toggle(l.id)" aria-label="Select" /></td></ng-container>
          <ng-container matColumnDef="who"><th mat-header-cell *matHeaderCellDef>Student / Parent</th>
            <td mat-cell *matCellDef="let l"><div class="who"><k3-avatar [name]="l.student || l.parent" /><div><div class="n">{{ l.student || l.parent }} @if (l.unread) {<span class="ubadge" matTooltip="Unread WhatsApp">{{ l.unread }}</span>}</div><div class="s">{{ l.parent }} · {{ l.phone }}</div></div></div></td></ng-container>
          <ng-container matColumnDef="program"><th mat-header-cell *matHeaderCellDef>Program</th><td mat-cell *matCellDef="let l" class="nowrap">{{ l.program }}</td></ng-container>
          <ng-container matColumnDef="source"><th mat-header-cell *matHeaderCellDef>Source</th><td mat-cell *matCellDef="let l" class="nowrap">{{ l.source }}</td></ng-container>
          <ng-container matColumnDef="ai"><th mat-header-cell *matHeaderCellDef>AI qualification</th><td mat-cell *matCellDef="let l"><k3-score [score]="l.ai.score" [temp]="l.ai.temp" /></td></ng-container>
          <ng-container matColumnDef="stage"><th mat-header-cell *matHeaderCellDef>Stage</th><td mat-cell *matCellDef="let l"><k3-stage [stage]="l.stage" /></td></ng-container>
          <ng-container matColumnDef="owner"><th mat-header-cell *matHeaderCellDef>Owner</th><td mat-cell *matCellDef="let l"><k3-owner [id]="l.counsellorId" /></td></ng-container>
          <ng-container matColumnDef="last"><th mat-header-cell *matHeaderCellDef>Last activity</th><td mat-cell *matCellDef="let l" class="nowrap muted">{{ rel(l.lastActivityAt) }}</td></ng-container>
          <ng-container matColumnDef="fu"><th mat-header-cell *matHeaderCellDef>Next follow-up</th><td mat-cell *matCellDef="let l" class="nowrap" [class.over]="due(l.nextFollowUp).over" [class.muted]="!due(l.nextFollowUp).over">{{ due(l.nextFollowUp).text }}</td></ng-container>
          <tr mat-header-row *matHeaderRowDef="cols(); sticky: true"></tr>
          <tr mat-row *matRowDef="let l; columns: cols()" class="clickable" [class.selected]="sel().has(l.id)" (click)="open(l.id)"></tr>
        </table>
      </div>
    }
  </div>`,
  styles: [`.search-f{width:260px;max-width:100%} .toolbar .filters mat-form-field{width:150px}
    .mcards{display:flex;flex-direction:column;gap:8px} .mcard{display:flex;gap:6px;align-items:flex-start;background:var(--mat-sys-surface);border-radius:16px;padding:10px 12px 10px 4px;border:1px solid var(--mat-sys-outline-variant);cursor:pointer}
    .mcard.selected{background:var(--mat-sys-secondary-container)}
    @media (max-width:760px){.search-f{width:100%}.toolbar .filters{width:100%;overflow-x:auto;flex-wrap:nowrap;scrollbar-width:none}.toolbar .filters mat-form-field{flex:none;width:150px}}`],
})
export class LeadsPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private nav = inject(LeadNav); private route = inject(ActivatedRoute); private router = inject(Router);
  T = TEMP; SL = STAGE_LABEL; SC = STAGE_COLOR; stages = STAGES; temps = ['hot', 'warm', 'cold']; rel = rel; due = dueLabel; Set = Set;
  leads = signal<any[]>([]); loading = signal(true); sel = signal(new Set<string>());
  f = signal<any>({ q: '', temp: '', stage: '', source: '', program: '', counsellor: '' });
  view = signal<'list' | 'board'>('list');
  private bp = inject(BreakpointObserver);
  mobile = toSignal(this.bp.observe('(max-width: 760px)').pipe(map(r => r.matches)), { initialValue: false });
  wide = toSignal(this.bp.observe('(min-width: 1600px)').pipe(map(r => r.matches)), { initialValue: true });
  mid = toSignal(this.bp.observe('(min-width: 1180px)').pipe(map(r => r.matches)), { initialValue: true });
  cols = computed(() => this.wide() ? ['sel', 'who', 'program', 'source', 'ai', 'stage', 'owner', 'last', 'fu'] : this.mid() ? ['sel', 'who', 'program', 'ai', 'stage', 'owner', 'fu'] : ['sel', 'who', 'ai', 'stage', 'fu']);
  byStage = computed(() => Object.fromEntries(STAGES.map(st => [st, this.leads().filter(l => l.stage === st)])) as Record<string, any[]>);
  allSel = computed(() => this.leads().length > 0 && this.leads().every(l => this.sel().has(l.id)));
  summary = computed(() => { const ls = this.leads(); return `${ls.length} lead${ls.length === 1 ? '' : 's'} · ${ls.filter(l => l.ai?.temp === 'hot').length} hot · ${ls.filter(l => l.unread).length} unread`; });

  constructor() {
    this.route.queryParamMap.subscribe(p => {
      const f = Object.assign({ q: '', temp: '', stage: '', source: '', program: '', counsellor: '' }, Object.fromEntries(['q', 'temp', 'stage', 'source', 'program', 'counsellor'].filter(k => p.get(k)).map(k => [k, p.get(k)])));
      this.f.set(f); this.view.set(p.get('view') === 'board' ? 'board' : 'list'); this.load();
    });
    const sub = this.s.events.subscribe(e => { if (e.type === 'lead' || (e.type === 'message' && e.data.message?.from === 'lead')) this.load(true); });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
  private nav_(patch: any) { this.router.navigate([], { queryParams: patch, queryParamsHandling: 'merge', replaceUrl: true }); }
  set(k: string, v: string) { this.nav_({ [k]: v || null }); }
  setView(v: string) { this.nav_({ view: v === 'board' ? 'board' : null }); }
  search = debounce((q: string) => this.set('q', q), 300);
  async load(quiet = false) {
    if (!quiet) this.loading.set(true);
    try { this.leads.set(await this.api.leads(this.f())); } catch (e) { this.ui.error(e); }
    this.loading.set(false);
  }
  clearSel() { this.sel.set(new Set()); }
  toggle(id: string) { const n = new Set(this.sel()); n.has(id) ? n.delete(id) : n.add(id); this.sel.set(n); }
  toggleAll() { this.sel.set(this.allSel() ? new Set() : new Set(this.leads().map(l => l.id))); }
  async open(id: string) { if (await this.nav.open(id)) this.load(true); }
  async drop(e: CdkDragDrop<string>) {
    const l = e.item.data; const stage = e.container.data; if (l.stage === stage) return;
    this.leads.update(ls => ls.map(x => x.id === l.id ? Object.assign({}, x, { stage }) : x));
    try {
      await this.api.updateLead(l.id, { stage });
      this.ui.toast(`${l.student || l.parent} → ${STAGE_LABEL[stage]}${stage === 'visit' ? ' · visit reminders scheduled' : stage === 'application' ? ' · fee deadline nudges started' : ''}`);
      this.load(true);
    } catch (err) { this.ui.error(err); this.load(true); }
  }
  newLead() { this.ui.open(NewLeadDialog, null, { width: '640px' }).afterClosed().subscribe(l => l && this.load(true)); }
  importCsv() { this.ui.open(ImportDialog, null, { width: '680px' }).afterClosed().subscribe(ok => ok && this.load()); }
  async qualifyAll() {
    const ref = this.ui.open<QualifyAllDialog>(QualifyAllDialog, null, { width: '480px' });
    try { const r = await this.api.qualifyAll(); ref.componentInstance.r.set(r); this.load(true); } catch (e) { ref.close(); this.ui.error(e); }
  }
  private ids() { return [...this.sel()]; }
  bulkBroadcast() { BroadcastDraft.set({ segment: { leadIds: this.ids() } }); this.router.navigateByUrl('/broadcasts/new'); }
  async bulkSeq() {
    const seqs = await this.api.sequences(); const ids = this.ids();
    this.ui.open(PickDialog, { title: `Enroll ${ids.length} leads`, label: 'Nurture sequence', ok: 'Enroll', note: 'Leads start receiving the sequence’s WhatsApp messages from the next scheduled step.', options: seqs.map(q => ({ value: q.id, label: q.name + (q.active ? '' : ' (paused)') })) }, { width: '460px' })
      .afterClosed().subscribe(async id => { if (!id) return; await this.api.enroll(id, ids); this.ui.toast(`${ids.length} leads enrolled in “${seqs.find(q => q.id === id)?.name}”`); this.sel.set(new Set()); this.load(true); });
  }
  bulkAssign() {
    const ids = this.ids();
    this.ui.open(PickDialog, { title: `Assign ${ids.length} leads`, label: 'Counsellor', ok: 'Assign', options: this.s.meta().counsellors.map((c: any) => ({ value: c.id, label: c.name })) }, { width: '420px' })
      .afterClosed().subscribe(async id => { if (!id) return; await Promise.all(ids.map(l => this.api.updateLead(l, { counsellorId: id }))); this.ui.toast('Leads reassigned'); this.sel.set(new Set()); this.load(true); });
  }
  bulkStage() {
    const ids = this.ids();
    this.ui.open(PickDialog, { title: `Move ${ids.length} leads`, label: 'New stage', ok: 'Move', options: STAGES.map(s => ({ value: s, label: STAGE_LABEL[s] })) }, { width: '420px' })
      .afterClosed().subscribe(async st => { if (!st) return; await Promise.all(ids.map(l => this.api.updateLead(l, { stage: st }))); this.ui.toast('Moved to ' + STAGE_LABEL[st]); this.sel.set(new Set()); this.load(true); });
  }
}
