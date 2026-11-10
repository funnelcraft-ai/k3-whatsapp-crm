import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { fmtDate, num, pct } from '../core/util';
import { Kpi } from '../shared/bits';
import { BroadcastDraft } from './broadcast-draft';

@Component({
  selector: 'k3-failed', imports: [MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `<h2 mat-dialog-title>Failed messages</h2>
  <mat-dialog-content>
    <p class="small muted" style="margin-top:0">Temporary errors (rate limits, Meta outages) are retried automatically with back-off. These failed permanently or ran out of retries.</p>
    <div class="tbl-wrap" style="max-height:50vh">
      <table mat-table [dataSource]="d.list">
        <ng-container matColumnDef="p"><th mat-header-cell *matHeaderCellDef>Parent</th><td mat-cell *matCellDef="let x">{{ x.parent }}</td></ng-container>
        <ng-container matColumnDef="ph"><th mat-header-cell *matHeaderCellDef>Phone</th><td mat-cell *matCellDef="let x" class="nowrap">{{ x.phone }}</td></ng-container>
        <ng-container matColumnDef="a"><th mat-header-cell *matHeaderCellDef class="num">Attempts</th><td mat-cell *matCellDef="let x" class="num">{{ x.attempts }}{{ x.retrying ? ' ↻' : '' }}</td></ng-container>
        <ng-container matColumnDef="e"><th mat-header-cell *matHeaderCellDef>Reason</th><td mat-cell *matCellDef="let x" class="small">{{ x.error }}</td></ng-container>
        <tr mat-header-row *matHeaderRowDef="cols; sticky: true"></tr><tr mat-row *matRowDef="let r; columns: cols"></tr>
      </table>
    </div>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Close</button><button mat-flat-button [mat-dialog-close]="true" [disabled]="!retryable"><mat-icon>replay</mat-icon>Retry {{ retryable }} failed</button></mat-dialog-actions>`,
})
export class FailedDialog { d = inject<any>(MAT_DIALOG_DATA); cols = ['p', 'ph', 'a', 'e']; retryable = this.d.list.filter((x: any) => !x.retrying).length; }

@Component({
  selector: 'k3-broadcasts',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, Kpi],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Broadcasts</h1><div class="sub">Bulk WhatsApp campaigns with creatives to segmented parent lists</div></div>
      <div class="grow"></div><a mat-flat-button routerLink="/broadcasts/new" (click)="fresh()"><mat-icon>campaign</mat-icon>New broadcast</a>
    </div>
    <div class="kpis">
      <k3-kpi icon="send" label="Messages sent" [value]="num(sum('sent'))" [delta]="done().length + ' campaigns'" />
      <k3-kpi icon="done_all" label="Delivered" [value]="pct(sum('delivered') / (sum('sent') || 1))" [delta]="num(sum('delivered')) + ' delivered'" />
      <k3-kpi icon="visibility" label="Read rate" [value]="pct(sum('read') / (sum('delivered') || 1))" delta="of delivered" />
      <k3-kpi icon="reply" label="Replies" [value]="num(sum('replied'))" [delta]="pct(sum('replied') / (sum('delivered') || 1)) + ' reply rate'" />
      <k3-kpi icon="ads_click" label="Button clicks" [value]="num(sum('clicked'))" delta="Book visit / apply" />
    </div>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    <div class="col" style="gap:12px">
      @for (b of list(); track b.id) {
        <div class="bc">
          @if (b.creative?.type === 'image' && b.creative?.url) { <img [src]="b.creative.url" alt="" class="thumb"> }
          @else { <div class="thumb ph"><mat-icon>{{ b.creative?.type === 'video' ? 'movie' : b.creative?.type === 'document' ? 'picture_as_pdf' : 'chat' }}</mat-icon></div> }
          <div class="grow" style="min-width:0">
            <div class="row wrap"><b class="title">{{ b.name }}</b><span class="pill {{ pill[b.status] || 'p-grey' }}">{{ b.status }}</span><span class="grow"></span>
              <span class="small muted">{{ b.status === 'Scheduled' ? 'Scheduled for ' : '' }}{{ b.sentAt ? when(b.sentAt) : 'Not sent' }}</span></div>
            <div class="small muted row wrap" style="gap:4px;margin-top:2px"><mat-icon class="sm">group</mat-icon>{{ b.audienceLabel }} · <b class="tnum">{{ num(b.stats.audience) }}</b> recipients · template <code>{{ b.template }}</code></div>
            @if (b.status === 'Sending') {
              <mat-progress-bar mode="determinate" [value]="(b.stats.sent / (b.stats.audience || 1)) * 100" style="margin-top:10px" />
              <div class="small muted" style="margin-top:4px">Sending… {{ num(b.stats.sent) }} / {{ num(b.stats.audience) }}</div>
            } @else if (b.status === 'Scheduled' || b.status === 'Draft') {
              <div class="row" style="margin-top:10px"><button mat-stroked-button (click)="send(b)" [disabled]="busy() === b.id"><mat-icon>send</mat-icon>Send now</button></div>
            } @else {
              <div class="rate">
                @for (r of rates(b); track r[0]) { <div class="r"><div class="small muted">{{ r[0] }}</div><div class="v">{{ pct(r[2]) }} <span class="small muted">{{ num(r[1]) }}</span></div><div class="b"><i [style.width.%]="r[2] * 100"></i></div></div> }
              </div>
            }
            @if (b.stats.failed || b.stats.retrying) {
              <div class="row wrap" style="margin-top:10px">
                @if (b.stats.retrying) {<span class="pill p-pend"><mat-icon>autorenew</mat-icon>{{ num(b.stats.retrying) }} retrying automatically</span>}
                @if (b.stats.failed) {<button mat-button class="err-btn" (click)="failed(b)"><mat-icon>error</mat-icon>{{ num(b.stats.failed) }} failed — view</button>}
              </div>
            }
          </div>
        </div>
      } @empty { @if (!loading()) { <div class="empty"><mat-icon>campaign</mat-icon><p>No broadcasts yet. Send your first WhatsApp campaign to parents.</p></div> } }
    </div>
  </div>`,
  styles: [`.bc{display:flex;gap:16px;background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:20px;padding:14px}
    .thumb{width:150px;height:84px;border-radius:12px;object-fit:cover;flex:none} .ph{background:var(--mat-sys-surface-container-high);display:grid;place-items:center}
    .title{font:var(--mat-sys-title-medium)} .rate{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:12px}
    .v{font:var(--mat-sys-title-medium)} .b{height:4px;border-radius:2px;background:var(--mat-sys-surface-container-highest);margin-top:4px;overflow:hidden} .b i{display:block;height:100%;background:var(--k3-s1)}
    .err-btn{--mat-button-text-label-text-color:var(--mat-sys-error);color:var(--mat-sys-error)!important}
    @media (max-width:600px){.bc{flex-direction:column}.thumb{width:100%;height:150px}.rate{grid-template-columns:repeat(2,1fr)}}`],
})
export class BroadcastsPage {
  private s = inject(Session); private api = inject(Api); private ui = inject(Ui);
  list = signal<any[]>([]); loading = signal(true); busy = signal<string | null>(null);
  num = num; pct = pct; when = (a: string) => fmtDate(a, { dateStyle: 'medium', timeStyle: 'short' });
  pill: Record<string, string> = { Completed: 'p-ok', Scheduled: 'p-blue', Sending: 'p-pend', Draft: 'p-grey', Failed: 'p-bad' };
  done = computed(() => this.list().filter(b => b.status === 'Completed'));
  sum = (k: string) => this.done().reduce((a, b) => a + (b.stats[k] || 0), 0);
  rates = (b: any): [string, number, number][] => { const s = b.stats; const r = (n: number, d: number) => d ? n / d : 0; return [['Delivered', s.delivered, r(s.delivered, s.sent || s.audience)], ['Read', s.read, r(s.read, s.delivered)], ['Replied', s.replied, r(s.replied, s.delivered)], ['Clicked', s.clicked, r(s.clicked, s.delivered)]]; };
  constructor() {
    this.load();
    const sub = this.s.events.subscribe(({ type, data }) => {
      if (type !== 'broadcast') return;
      this.list.update(a => a.some(b => b.id === data.id) ? a.map(b => b.id === data.id ? Object.assign({}, b, data) : b) : [data, ...a]);
      if (data.status === 'Completed') this.ui.toast(`“${data.name}” delivered to ${num(data.stats.delivered)} parents`);
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
  async load() { try { this.list.set(await this.api.broadcasts()); } catch (e) { this.ui.error(e); } this.loading.set(false); }
  fresh() { BroadcastDraft.set(null); }
  async send(b: any) { this.busy.set(b.id); try { await this.api.sendBroadcast(b.id); this.ui.toast('Broadcast is sending…'); } catch (e) { this.ui.error(e); } this.busy.set(null); this.load(); }
  async failed(b: any) {
    const list = await this.api.failed(b.id);
    this.ui.open(FailedDialog, { list }, { width: '760px' }).afterClosed().subscribe(async ok => {
      if (!ok) return; try { const r = await this.api.retryFailed(b.id); this.ui.toast(`${r.requeued} messages queued again`); this.load(); } catch (e) { this.ui.error(e); }
    });
  }
}
