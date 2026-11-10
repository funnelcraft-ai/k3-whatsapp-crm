import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { AV_COLORS, num, pct } from '../core/util';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';

const STEP_IC: Record<string, [string, string, string]> = { send: ['send', '#e6f4ea', '#137333'], task: ['assignment_ind', '#e3eeff', '#1967d2'], condition: ['call_split', '#fff0d6', '#a05a00'], wait: ['hourglass_top', '#eceef1', '#5f6368'] };
const DELAYS: [number, string][] = [[0, 'Instantly'], [60, 'After 1 hour'], [240, 'After 4 hours'], [1440, 'After 1 day'], [2880, 'After 2 days'], [4320, 'After 3 days'], [10080, 'After 1 week'], [20160, 'After 2 weeks']];

@Component({
  selector: 'k3-seq-builder', imports: FORM,
  template: `<h2 mat-dialog-title>New nurture sequence</h2>
  <mat-dialog-content>
    <div class="grid g-2" style="gap:0 12px">
      <mat-form-field><mat-label>Name</mat-label><input matInput [(ngModel)]="name" placeholder="e.g. Class 11 Science — results push"></mat-form-field>
      <mat-form-field><mat-label>Trigger</mat-label><mat-select [(ngModel)]="trigger">@for (t of s.meta().triggers || []; track t.id) {<mat-option [value]="t.id">{{ t.label }}</mat-option>}</mat-select></mat-form-field>
    </div>
    <div class="small muted" style="margin:0 0 8px">Steps — each delay is counted from the previous step</div>
    @for (st of steps; track $index; let i = $index) {
      <div class="step-row">
        <span class="n">{{ i + 1 }}</span>
        <mat-form-field subscriptSizing="dynamic" style="width:160px"><mat-select [(ngModel)]="st.delay" [disabled]="st.action.startsWith('condition')">@for (d of delays; track d[0]) {<mat-option [value]="d[0]">{{ d[1] }}</mat-option>}</mat-select></mat-form-field>
        <mat-form-field subscriptSizing="dynamic" class="grow"><mat-select [(ngModel)]="st.action">
          <mat-optgroup label="Send WhatsApp template">@for (t of data.templates; track t.id) {<mat-option [value]="'send|' + t.name">Send · {{ t.name }}</mat-option>}</mat-optgroup>
          <mat-optgroup label="Other"><mat-option value="task|Counsellor call task">Create counsellor call task</mat-option><mat-option value="condition|If no reply">Stop if the parent has replied</mat-option></mat-optgroup>
        </mat-select></mat-form-field>
        <button mat-icon-button (click)="steps.splice(i, 1)" [disabled]="steps.length < 2" aria-label="Remove step"><mat-icon>delete</mat-icon></button>
      </div>
    }
    <button mat-button (click)="steps.push({ delay: 1440, action: 'send|' + data.templates[0].name })"><mat-icon>add</mat-icon>Add step</button>
    <p class="small muted">Sequences only send Meta-approved templates, so they work outside the 24-hour window. Leads who reply STOP, are admitted or marked lost leave automatically.</p>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy() || !name.trim()">Create & activate</button></mat-dialog-actions>`,
  styles: [`.step-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}.n{width:24px;height:24px;border-radius:50%;background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);display:grid;place-items:center;font:var(--mat-sys-label-medium);flex:none}
    @media (max-width:560px){.step-row{flex-wrap:wrap}.step-row .grow{flex-basis:100%}}`],
})
export class SequenceBuilder {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  data = inject<any>(MAT_DIALOG_DATA);
  delays = DELAYS; busy = signal(false); name = ''; trigger = this.s.meta().triggers?.[0]?.id;
  steps = [{ delay: 0, action: 'send|' + this.data.templates[0].name }, { delay: 1440, action: 'task|Counsellor call task' }];
  async save() {
    this.busy.set(true);
    const steps = this.steps.map(r => {
      const [kind, title] = r.action.split('|'); const mins = kind === 'condition' ? 0 : r.delay;
      return { kind, delayMinutes: mins, delayLabel: kind === 'condition' ? '' : DELAYS.find(x => x[0] === mins)![1], title, template: kind === 'send' ? title : undefined, detail: kind === 'send' ? 'WhatsApp template' : kind === 'task' ? 'Assigned to lead owner' : 'Ends the sequence if the parent replied' };
    });
    try { await this.api.createSequence({ name: this.name.trim(), trigger: this.trigger, steps, color: AV_COLORS[Math.floor(Math.random() * 6)] }); this.ui.toast('Sequence created & activated'); this.ref.close(true); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-nurture',
  imports: [...FORM, MatSlideToggleModule, MatProgressBarModule, MatTooltipModule],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Nurture sequences</h1><div class="sub">{{ active() }} of {{ seqs().length }} active · {{ num(enrolled()) }} enrolments · automated WhatsApp drips triggered by stage & AI temperature</div></div>
      <div class="grow"></div><button mat-flat-button (click)="create()"><mat-icon>add</mat-icon>New sequence</button>
    </div>
    <div class="banner info"><mat-icon>hub</mat-icon><div class="small"><b>How it works:</b> every new enquiry gets an instant WhatsApp welcome. The AI qualifier re-scores leads on every reply and moves them between <span class="pill t-hot">Hot fast-track</span> <span class="pill t-warm">Warm nurture</span> <span class="pill t-cold">Cold re-engagement</span> automatically. Stage changes trigger visit & fee reminders.</div></div>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    <div class="grid g-3">
      @for (q of seqs(); track q.id) {
        <div class="seq" [class.off]="!q.active">
          <div class="row" style="align-items:flex-start">
            <div class="seq-ico" [style.background]="q.color"><mat-icon>conversion_path</mat-icon></div>
            <div class="grow" style="min-width:0"><div class="title">{{ q.name }}</div><div class="small muted row" style="gap:4px"><mat-icon class="sm">bolt</mat-icon>{{ q.trigger }}</div></div>
            @if (!demo && s.role() === 'admin') {<button mat-icon-button matTooltip="Delete sequence" (click)="remove(q)"><mat-icon>delete</mat-icon></button>}
            <mat-slide-toggle [checked]="q.active" (change)="toggle(q, $event.checked)" [attr.aria-label]="q.active ? 'Pause' : 'Activate'" />
          </div>
          <div class="seq-stats"><div><b class="tnum">{{ num(q.enrolled) }}</b>Enrolled</div><div><b class="tnum">{{ num(q.completed) }}</b>Completed</div><div><b class="tnum">{{ pct(q.replyRate) }}</b>Reply rate</div></div>
          <ul class="steps">
            @for (st of q.steps; track $index) {
              <li><div class="sic" [style.background]="ic(st.kind)[1]" [style.color]="ic(st.kind)[2]"><mat-icon>{{ ic(st.kind)[0] }}</mat-icon></div>
                <div><div class="st">@if (st.delay) {<span class="delay">{{ st.delay }}</span>}{{ st.title }}</div><div class="small muted">{{ st.detail }}</div></div></li>
            }
          </ul>
        </div>
      }
    </div>
  </div>`,
  styles: [`.seq{background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:20px;padding:16px;transition:opacity .2s}
    .seq.off{opacity:.62} .title{font:var(--mat-sys-title-medium)}
    .seq-ico{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#fff;flex:none}
    .seq-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:14px 0;padding:10px 0;border-block:1px solid var(--mat-sys-outline-variant);font:var(--mat-sys-body-small);color:var(--mat-sys-on-surface-variant);text-align:center}
    .seq-stats b{display:block;font:var(--mat-sys-title-medium);color:var(--mat-sys-on-surface)}
    .steps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
    .steps li{display:flex;gap:10px;align-items:flex-start} .sic{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;flex:none} .sic mat-icon{font-size:17px;width:17px;height:17px}
    .st{font:var(--mat-sys-body-medium)} .delay{font:var(--mat-sys-label-small);background:var(--mat-sys-surface-container-high);border-radius:6px;padding:2px 6px;margin-right:6px}`],
})
export class NurturePage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private router = inject(Router);
  demo = environment.demo; num = num; pct = pct; ic = (k: string) => STEP_IC[k] || STEP_IC['send'];
  seqs = signal<any[]>([]); loading = signal(true);
  active = computed(() => this.seqs().filter(q => q.active).length); enrolled = computed(() => this.seqs().reduce((a, q) => a + (q.enrolled || 0), 0));
  constructor() { this.load(); }
  async load() { try { this.seqs.set(await this.api.sequences()); } catch (e) { this.ui.error(e); } this.loading.set(false); }
  async toggle(q: any, v: boolean) {
    try { const r = await this.api.updateSequence(q.id, { active: v }); this.ui.toast(`“${q.name}” ${r.active ? 'activated' : 'paused'}`); this.seqs.update(a => a.map(x => x.id === q.id ? Object.assign({}, x, { active: r.active }) : x)); }
    catch (e) { this.ui.error(e); this.load(); }
  }
  async remove(q: any) {
    if (!(await this.ui.confirm('Delete sequence?', `Leads enrolled in “${q.name}” stop receiving its messages.`, 'Delete'))) return;
    try { await this.api.deleteSequence(q.id); this.ui.toast('Sequence deleted'); this.load(); } catch (e) { this.ui.error(e); }
  }
  async create() {
    const tpls = (await this.api.templates()).filter(t => t.status === 'Approved');
    if (!tpls.length) { this.ui.toast('No approved WhatsApp templates yet — sync or submit templates first'); this.router.navigateByUrl('/templates'); return; }
    this.ui.open(SequenceBuilder, { templates: tpls }, { width: '720px' }).afterClosed().subscribe(ok => ok && this.load());
  }
}
