import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { TEMP, dueLabel, rel } from '../core/util';
import { Avatar, Owner, StageTag, TempPill } from '../shared/bits';
import { Chat } from '../shared/chat';
import { FollowupDialog } from '../shared/dialogs';
import { LeadNav } from '../shared/lead-nav';

@Component({
  selector: 'k3-inbox',
  imports: [FormsModule, MatIconModule, MatButtonModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, Avatar, Owner, StageTag, TempPill, Chat],
  template: `
  <div class="inbox" [class.show-chat]="showChat()">
    <section class="convs">
      <div class="hd">
        <div class="row" style="margin-bottom:8px"><h1 class="grow">WhatsApp Inbox</h1><span class="small muted">{{ s.meta().whatsappNumber || '' }}</span></div>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="full"><mat-icon matPrefix>search</mat-icon><input matInput placeholder="Search chats" [(ngModel)]="q"></mat-form-field>
        <mat-chip-listbox [value]="filter()" (change)="filter.set($event.value || 'all')" aria-label="Filter chats" class="chips">
          @for (x of filters; track x[0]) {<mat-chip-option [value]="x[0]">{{ x[1] }}</mat-chip-option>}
        </mat-chip-listbox>
      </div>
      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
      <div class="lst">
        @for (c of list(); track c.id) {
          <div class="conv" [class.on]="c.id === active()" [class.unread]="c.unread" (click)="pick(c.id)">
            <k3-avatar [name]="c.parent" size="md" />
            <div class="meta">
              <div class="top"><span class="n">{{ c.parent }}</span><span class="t">{{ rel(c.lastMessage?.at) }}</span></div>
              <div class="bot"><span class="x">@if (c.lastMessage?.from === 'bot') {<mat-icon class="sm">smart_toy</mat-icon>} @else if (c.lastMessage && c.lastMessage.from !== 'lead') {<mat-icon class="sm">done_all</mat-icon>}{{ (c.lastMessage?.text || '').split('\\n')[0] }}</span>
                @if (c.unread) {<span class="ubadge">{{ c.unread }}</span>} @else {<span class="sw" [style.background]="T[c.ai?.temp]?.color" style="border-radius:50%"></span>}</div>
            </div>
          </div>
        } @empty { @if (!loading()) {<div class="empty"><mat-icon>forum</mat-icon><p>No conversations</p></div>} }
      </div>
    </section>
    <section class="chatpane">
      @if (lead(); as l) { <k3-chat [lead]="l" (back)="showChat.set(false)" (openLead)="openLead($event)" (sent)="onSent(l.id, $event)" /> }
      @else { <div class="empty" style="margin:auto"><mat-icon>chat</mat-icon><p>Select a conversation</p></div> }
    </section>
    <aside class="side">
      @if (lead(); as l) {
        <div style="text-align:center;margin-bottom:14px"><k3-avatar [name]="l.student || l.parent" size="lg" /><div style="font:var(--mat-sys-title-medium);margin-top:8px">{{ l.student || l.parent }}</div><div class="small muted">{{ l.program }}@if (l.area) { · {{ l.area }}}</div></div>
        <div class="ai-card" style="padding:14px">
          <div class="row"><k3-temp [temp]="l.ai.temp" [score]="l.ai.score" /><span class="grow"></span><span class="small muted">AI score</span></div>
          @if (l.ai.nextAction) {<div class="small" style="margin-top:10px"><span class="muted">Next best action</span><br><b>{{ l.ai.nextAction }}</b></div>}
        </div>
        <div class="kv" style="grid-template-columns:92px 1fr;font:var(--mat-sys-body-small)">
          <span class="k">Stage</span><k3-stage [stage]="l.stage" />
          <span class="k">Owner</span><span class="row"><k3-owner [id]="l.counsellorId" />{{ owner(l.counsellorId) }}</span>
          <span class="k">Source</span><span>{{ l.source }}</span>
          <span class="k">Follow-up</span><span>{{ due(l.nextFollowUp).text }}</span>
        </div>
        <div class="row wrap" style="margin-top:14px"><button mat-flat-button (click)="openLead(l.id)"><mat-icon>person</mat-icon>Profile</button><button mat-stroked-button (click)="followup(l)"><mat-icon>event</mat-icon>Follow-up</button></div>
      }
    </aside>
  </div>`,
  styles: [`
    :host{display:block;height:100%}
    .inbox{display:grid;grid-template-columns:340px minmax(0,1fr) 300px;height:calc(100dvh - 96px);background:var(--mat-sys-surface);border-radius:24px;overflow:hidden;border:1px solid var(--mat-sys-outline-variant)}
    .convs{display:flex;flex-direction:column;min-height:0;border-right:1px solid var(--mat-sys-outline-variant)}
    .hd{padding:16px 16px 8px} .hd h1{font:var(--mat-sys-title-large);margin:0} .chips{margin-top:8px;display:block} :host ::ng-deep .chips .mdc-evolution-chip-set__chips{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;margin-left:0} :host ::ng-deep .chips .mat-mdc-chip{flex:none}
    .lst{overflow-y:auto;flex:1;min-height:0;padding:4px 8px 8px}
    .conv{display:flex;gap:12px;align-items:center;padding:10px;border-radius:16px;cursor:pointer}
    .conv:hover{background:var(--mat-sys-surface-container)} .conv.on{background:var(--mat-sys-secondary-container)}
    .conv .meta{flex:1;min-width:0} .conv .top,.conv .bot{display:flex;align-items:center;gap:8px}
    .conv .n{flex:1;font:var(--mat-sys-title-small);white-space:nowrap;overflow:hidden;text-overflow:ellipsis} .conv .t{font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant)}
    .conv .x{flex:1;font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:2px}
    .conv.unread .n,.conv.unread .x{font-weight:700;color:var(--mat-sys-on-surface)} .conv.unread .t{color:var(--k3-wa);font-weight:600}
    .chatpane{display:flex;flex-direction:column;min-height:0;min-width:0}
    .side{border-left:1px solid var(--mat-sys-outline-variant);padding:20px 16px;overflow-y:auto}
    @media (max-width:1279px){.inbox{grid-template-columns:320px minmax(0,1fr)}.side{display:none}}
    @media (max-width:860px){.inbox{grid-template-columns:1fr;height:calc(100dvh - 80px);border-radius:0;border:0;margin:0 -12px}
      .chatpane{display:none}.inbox.show-chat .convs{display:none}.inbox.show-chat .chatpane{display:flex}}`],
})
export class InboxPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private nav = inject(LeadNav); private route = inject(ActivatedRoute); private router = inject(Router);
  T = TEMP; rel = rel; due = dueLabel;
  filters = [['all', 'All'], ['unread', 'Unread'], ['hot', 'Hot'], ['warm', 'Warm'], ['cold', 'Cold']];
  convs = signal<any[]>([]); loading = signal(true); filter = signal('all'); active = signal<string | null>(null); lead = signal<any>(null); showChat = signal(false);
  private _q = signal(''); get q() { return this._q(); } set q(v: string) { this._q.set(v); }
  list = computed(() => { const q = this._q().toLowerCase(); const f = this.filter(); return this.convs().filter(c => (f === 'all' || (f === 'unread' ? c.unread : c.ai?.temp === f)) && (!q || `${c.parent} ${c.student} ${c.phone}`.toLowerCase().includes(q))); });
  owner = (id: string) => this.s.meta().counsellors?.find((c: any) => c.id === id)?.name || 'Unassigned';

  constructor() {
    this.load();
    const sub = this.s.events.subscribe(({ type, data }) => {
      if (type !== 'message') return;
      const m = data.message; const id = data.leadId;
      this.convs.update(cs => {
        let list = cs.slice(); let c = list.find(x => x.id === id);
        if (!c && data.lead) { c = Object.assign({}, data.lead); list.unshift(c); }
        if (!c) return cs;
        const nc = Object.assign({}, c, { lastMessage: { text: m.text, from: m.from, at: m.at }, ai: data.lead?.ai || c.ai, unread: m.from === 'lead' && id !== this.active() ? (c.unread || 0) + 1 : c.unread });
        list = list.map(x => x.id === id ? nc : x);
        return list.sort((a, b) => (b.lastMessage?.at || '').localeCompare(a.lastMessage?.at || ''));
      });
      if (id === this.active() && data.lead?.ai) this.lead.update(l => l ? Object.assign({}, l, { ai: Object.assign({}, l.ai, data.lead.ai), windowOpen: m.from === 'lead' ? true : l.windowOpen }) : l);
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
  async load() {
    try {
      const cs = await this.api.conversations(); this.convs.set(cs);
      const want = this.route.snapshot.queryParamMap.get('lead');
      const first = want || (window.innerWidth > 860 ? (cs.find(c => c.unread) || cs[0])?.id : null);
      if (first) this.pick(first, !!want);
    } catch (e) { this.ui.error(e); }
    this.loading.set(false);
  }
  async pick(id: string, show = true) {
    this.active.set(id); this.showChat.set(show || window.innerWidth > 860);
    this.convs.update(cs => cs.map(c => c.id === id ? Object.assign({}, c, { unread: 0 }) : c));
    try { const l = await this.api.lead(id); if (this.active() === id) this.lead.set(l); } catch (e) { this.ui.error(e); }
  }
  onSent(id: string, m: any) { this.convs.update(cs => cs.map(c => c.id === id ? Object.assign({}, c, { lastMessage: { text: m.text, from: m.from, at: m.at } }) : c).sort((a, b) => (b.lastMessage?.at || '').localeCompare(a.lastMessage?.at || ''))); }
  async openLead(id: string) { if (await this.nav.open(id)) this.pick(id); }
  followup(l: any) { this.ui.open(FollowupDialog, { lead: l }).afterClosed().subscribe(f => f && this.pick(l.id)); }
}
