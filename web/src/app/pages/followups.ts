import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { FU_TYPE, dueLabel, isToday, pct } from '../core/util';
import { Owner, TempPill } from '../shared/bits';
import { FollowupDialog } from '../shared/dialogs';
import { LeadNav } from '../shared/lead-nav';

@Component({
  selector: 'k3-followups',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatTabsModule, MatSelectModule, MatFormFieldModule, MatTooltipModule, MatProgressBarModule, Owner, TempPill],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Follow-ups</h1><div class="sub">{{ g().overdue.length }} overdue · {{ g().today.length }} due today · {{ autoShare() }} auto-scheduled by AI & sequences</div></div>
      <div class="grow"></div>
      <mat-form-field appearance="outline" subscriptSizing="dynamic" style="width:190px"><mat-select [(ngModel)]="owner" placeholder="All counsellors"><mat-option value="">All counsellors</mat-option>@for (c of s.meta().counsellors; track c.id) {<mat-option [value]="c.id">{{ c.name }}</mat-option>}</mat-select></mat-form-field>
      <button mat-flat-button (click)="add()"><mat-icon>add_task</mat-icon>Add follow-up</button>
    </div>
    <nav mat-tab-nav-bar [tabPanel]="panel" mat-stretch-tabs="false" class="tabs-bar">
      @for (t of tabs; track t[0]) {
        <a mat-tab-link [active]="tab() === t[0]" (click)="tab.set(t[0])">{{ t[1] }}<span class="pill {{ t[0] === 'overdue' && g()[t[0]].length ? 'p-bad' : 'p-grey' }}" style="margin-left:8px">{{ g()[t[0]].length }}</span></a>
      }
    </nav>
    <mat-tab-nav-panel #panel>
      @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
      <div class="fu-list">
        @for (f of g()[tab()]; track f.id) {
          <div class="fu" [class.done]="f.done">
            <mat-checkbox [checked]="f.done" (change)="done(f, $event.checked)" aria-label="Mark done" />
            <div class="tico" [style.background]="T[f.type]?.bg" [style.color]="T[f.type]?.fg"><mat-icon>{{ T[f.type]?.icon }}</mat-icon></div>
            <div class="meta" (click)="open(f.leadId)">
              <div class="note">{{ f.note }}</div>
              <div class="small muted row wrap" style="gap:6px">{{ f.lead?.parent }} · {{ f.lead?.program }} <k3-temp [temp]="f.lead?.ai?.temp" />@if (f.auto) {<span class="pill p-blue"><mat-icon>auto_awesome</mat-icon>Auto</span>}</div>
            </div>
            <span class="small nowrap due" [class.over]="due(f.due).over && !f.done" [class.muted]="!due(f.due).over || f.done">{{ due(f.due).text }}</span>
            <k3-owner [id]="f.owner" class="hide-xs" />
            <div class="acts">
              <button mat-icon-button matTooltip="WhatsApp" (click)="open(f.leadId, 'whatsapp')"><mat-icon>chat</mat-icon></button>
              @if (!f.done) {<button mat-icon-button matTooltip="Snooze 1 day" (click)="snooze(f)"><mat-icon>snooze</mat-icon></button>}
            </div>
          </div>
        } @empty { @if (!loading()) { <div class="empty"><mat-icon>task_alt</mat-icon><p>{{ tab() === 'done' ? 'Nothing completed yet' : 'Nothing here — great job!' }}</p></div> } }
      </div>
    </mat-tab-nav-panel>
  </div>`,
  styles: [`.tabs-bar{margin-bottom:12px;background:transparent}
    .fu-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}
    .fu{display:flex;align-items:center;gap:12px;background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:16px;padding:8px 8px 8px 4px}
    .fu.done .note{text-decoration:line-through;color:var(--mat-sys-on-surface-variant)}
    .meta{flex:1;min-width:0;cursor:pointer} .note{font:var(--mat-sys-title-small)} .acts{display:flex}
    @media (max-width:600px){.fu{flex-wrap:wrap}.meta{flex-basis:calc(100% - 110px)}.due{margin-left:52px}.acts{margin-left:auto}}`],
})
export class FollowupsPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private nav = inject(LeadNav);
  T = FU_TYPE; due = dueLabel;
  tabs: [string, string][] = [['overdue', 'Overdue'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['done', 'Completed']];
  all = signal<any[]>([]); loading = signal(true); tab = signal('today');
  private _owner = signal(''); get owner() { return this._owner(); } set owner(v: string) { this._owner.set(v); }
  autoShare = computed(() => pct(this.all().filter(f => f.auto).length / (this.all().length || 1)));
  g = computed<Record<string, any[]>>(() => {
    const now = new Date(); const mine = this.all().filter(f => !this._owner() || f.owner === this._owner());
    const by = (fn: (f: any) => boolean, desc = false) => mine.filter(fn).sort((a, b) => desc ? b.due.localeCompare(a.due) : a.due.localeCompare(b.due));
    return {
      overdue: by(f => !f.done && new Date(f.due) < now && !isToday(f.due)), today: by(f => !f.done && isToday(f.due)),
      upcoming: by(f => !f.done && new Date(f.due) > now && !isToday(f.due)), done: by(f => f.done, true),
    };
  });
  constructor() { this.load(); }
  async load() { try { const a = await this.api.followups(); this.all.set(a); if (!this.g()['today'].length && this.g()['overdue'].length && this.loading()) this.tab.set('overdue'); } catch (e) { this.ui.error(e); } this.loading.set(false); }
  async done(f: any, v: boolean) {
    await this.api.updateFollowup(f.id, { done: v }); this.all.update(a => a.map(x => x.id === f.id ? Object.assign({}, x, { done: v }) : x)); this.s.refreshBadges();
    this.ui.toast(v ? 'Follow-up completed ✓' : 'Marked as pending', 'Undo', async () => { await this.api.updateFollowup(f.id, { done: !v }); this.load(); });
  }
  async snooze(f: any) {
    const nd = new Date(Math.max(Date.now(), new Date(f.due).getTime()) + 864e5); nd.setHours(10, 30, 0, 0);
    await this.api.updateFollowup(f.id, { due: nd.toISOString() }); this.ui.toast('Snoozed to ' + dueLabel(nd.toISOString()).text); this.s.refreshBadges(); this.load();
  }
  add() { this.ui.open(FollowupDialog, {}).afterClosed().subscribe(f => f && this.load()); }
  async open(id: string, tab?: string) { if (await this.nav.open(id, tab)) this.load(); }
}
