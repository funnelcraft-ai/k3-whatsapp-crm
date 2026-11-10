import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { VAR_DEFAULTS, debounce, fillTemplate, num, pct, varCount } from '../core/util';
import { environment } from '../../environments/environment';
import { FORM } from '../shared/dialogs';
import { BroadcastDraft } from './broadcast-draft';

const FALLBACK_SOURCES = { parent_first: 'Parent first name', parent_full: 'Parent full name', student_first: 'Student first name', student_full: 'Student full name', program: 'Program / class', phone: 'Phone number', area: 'Area / city', counsellor: 'Counsellor name', institution: 'Institution name', session: 'Admission session', deadline: 'Deadline text (Settings)', apply_link: 'Application link (Settings)' };

/* map {{n}} placeholders to lead data */
@Component({
  selector: 'k3-vars', imports: FORM,
  template: `<h2 mat-dialog-title>Template variables · <span class="mono" style="font-size:.85em">{{ t.name }}</span></h2>
  <mat-dialog-content>
    <p class="small muted" style="margin-top:0">Choose what fills each placeholder when this template is sent from chats, sequences or broadcasts.</p>
    @for (r of rows; track $index; let i = $index) {
      <div class="row var-row">
        <code style="width:44px;flex:none">{{ ph(i) }}</code>
        <mat-form-field subscriptSizing="dynamic" class="grow"><mat-select [(ngModel)]="r.kind" (ngModelChange)="prev()">
          @for (o of sources(); track o[0]) {<mat-option [value]="o[0]">{{ o[1] }}</mat-option>}
          <mat-option value="__field">Lead custom field…</mat-option><mat-option value="__custom">Fixed text…</mat-option></mat-select></mat-form-field>
        @if (r.kind === '__field') {
          <mat-form-field subscriptSizing="dynamic" class="grow"><mat-label>Field name</mat-label><mat-select [(ngModel)]="r.extra" (ngModelChange)="prev()">@for (f of info().customFields || []; track f) {<mat-option [value]="f">{{ f }}</mat-option>}</mat-select>
            @if (!(info().customFields || []).length) {<mat-hint>No custom fields yet — add them on a lead or import extra CSV columns</mat-hint>}</mat-form-field>
        } @else if (r.kind === '__custom') {
          <mat-form-field subscriptSizing="dynamic" class="grow"><mat-label>Text</mat-label><input matInput [(ngModel)]="r.extra" (ngModelChange)="prev()"></mat-form-field>
        }
      </div>
    }
    <div class="small muted" style="margin:14px 0 6px">Preview (latest lead)</div>
    <div class="chat" style="border-radius:12px;padding:12px;height:auto"><div class="bub in" style="max-width:100%">{{ preview() }}</div></div>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button (click)="reset()">Reset to default</button><span class="grow"></span><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()">Save mapping</button></mat-dialog-actions>`,
  styles: [`.var-row{margin-bottom:10px;align-items:flex-start} .var-row code{margin-top:16px}`],
})
export class VarsDialog {
  private api = inject(Api); private ui = inject(Ui); private s = inject(Session); private ref = inject(MatDialogRef);
  t = inject<any>(MAT_DIALOG_DATA); info = signal<any>({ sources: FALLBACK_SOURCES, defaults: VAR_DEFAULTS, customFields: [] }); preview = signal('');
  ph = (i: number) => '{{' + (i + 1) + '}}';
  sources = computed(() => Object.entries(this.info().sources));
  rows = Array.from({ length: varCount(this.t.body) }, (_, i) => { const v: string = (this.t.varMap || [])[i] || VAR_DEFAULTS[i] || 'institution'; return v.startsWith('field:') ? { kind: '__field', extra: v.slice(6) } : v.startsWith('custom:') ? { kind: '__custom', extra: v.slice(7) } : { kind: v, extra: '' }; });
  constructor() { this.api.templateVariables().then(i => this.info.set(i)).catch(() => {}); this.prev(); }
  map() { return this.rows.map(r => r.kind === '__field' ? 'field:' + r.extra.trim() : r.kind === '__custom' ? 'custom:' + r.extra.trim() : r.kind); }
  prev = debounce(async () => {
    const vm = this.map();
    try { const r = environment.demo ? { text: fillTemplate(Object.assign({}, this.t, { varMap: vm }), null, this.s.meta()) } : await this.api.previewTemplate(this.t.id, { varMap: vm }); this.preview.set(r.text); }
    catch { this.preview.set(fillTemplate(Object.assign({}, this.t, { varMap: vm }), null, this.s.meta())); }
  }, 250);
  async save() { const vm = this.map(); if (vm.some(v => v === 'field:' || v === 'custom:')) { this.ui.toast('Fill in the field name / text'); return; } await this.api.updateTemplate(this.t.id, { varMap: vm }); this.ui.toast('Variable mapping saved'); this.ref.close(true); }
  async reset() { await this.api.updateTemplate(this.t.id, { varMap: [] }); this.ui.toast('Variables reset to default'); this.ref.close(true); }
}

@Component({
  selector: 'k3-new-template', imports: FORM,
  template: `<h2 mat-dialog-title>New WhatsApp template</h2>
  <mat-dialog-content>
    <div class="grid g-3" style="gap:0 12px">
      <mat-form-field><mat-label>Name</mat-label><input matInput [(ngModel)]="f.name" placeholder="scholarship_test_invite"><mat-hint>lowercase_with_underscores</mat-hint></mat-form-field>
      <mat-form-field><mat-label>Category</mat-label><mat-select [(ngModel)]="f.category"><mat-option value="Marketing">Marketing</mat-option><mat-option value="Utility">Utility</mat-option></mat-select></mat-form-field>
      <mat-form-field><mat-label>Language</mat-label><mat-select [(ngModel)]="f.language"><mat-option value="en">English</mat-option><mat-option value="en_US">English (US)</mat-option><mat-option value="bn">Bengali</mat-option><mat-option value="hi">Hindi</mat-option></mat-select></mat-form-field>
    </div>
    <div class="grid g-2" style="gap:0 12px">
      <mat-form-field><mat-label>Header</mat-label><mat-select [(ngModel)]="f.header"><mat-option value="none">None</mat-option><mat-option value="image">Image</mat-option><mat-option value="video">Video</mat-option><mat-option value="document">Document</mat-option></mat-select></mat-form-field>
      <mat-form-field><mat-label>Buttons (comma separated, max 3)</mat-label><input matInput [(ngModel)]="buttons" placeholder="Book a visit, Talk to counsellor"></mat-form-field>
    </div>
    @if (f.header !== 'none') {
      <div class="row small" style="margin:-4px 0 12px"><button mat-stroked-button (click)="file.click()"><mat-icon>upload</mat-icon>Sample for {{ f.header }} header</button><span class="muted">{{ sampleName() || 'Required by Meta for media headers' }}</span></div>
      <input #file type="file" hidden accept="image/jpeg,image/png,video/mp4,application/pdf" (change)="sample($event)">
    }
    <mat-form-field class="full"><mat-label>Body — use &#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125; for variables</mat-label><textarea matInput rows="5" [(ngModel)]="f.body"></textarea></mat-form-field>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button (click)="save()" [disabled]="busy()">Submit for approval</button></mat-dialog-actions>`,
})
export class NewTemplateDialog {
  private api = inject(Api); private ui = inject(Ui); private ref = inject(MatDialogRef);
  busy = signal(false); sampleName = signal(''); sampleId = ''; buttons = '';
  f: any = { name: '', category: 'Marketing', language: 'en', header: 'none', body: 'Hi {{1}}, our Scholarship Test for {{2}} is on 15 December. Top 10 students get up to 50% tuition waiver! Register below.' };
  async sample(e: Event) { const i = e.target as HTMLInputElement; const file = i.files?.[0]; i.value = ''; if (!file) return; try { const m = await this.api.upload(file); this.sampleId = m.id; this.sampleName.set('✓ ' + file.name); } catch (err) { this.ui.error(err); } }
  async save() {
    const name = this.f.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'); if (!name) { this.ui.toast('Template name is required'); return; }
    if (this.f.header !== 'none' && !environment.demo && !this.sampleId) { this.ui.toast('Upload a sample for the media header'); return; }
    this.busy.set(true);
    try { await this.api.createTemplate(Object.assign({}, this.f, { name, buttons: this.buttons.split(',').map(x => x.trim()).filter(Boolean).slice(0, 3), sampleMediaId: this.sampleId || undefined })); this.ui.toast('Submitted to Meta · approval usually takes a few minutes to 24h'); this.ref.close(true); }
    catch (e) { this.ui.error(e); } this.busy.set(false);
  }
}

@Component({
  selector: 'k3-templates',
  imports: [...FORM, MatChipsModule, MatProgressBarModule, MatTooltipModule],
  template: `
  <div class="page">
    <div class="page-head">
      <div><h1>Message templates</h1><div class="sub">Meta-approved WhatsApp templates used by sequences, broadcasts and first-touch replies</div></div>
      <div class="grow"></div>
      @if (!demo && admin()) {
        <button mat-stroked-button (click)="sync()" [disabled]="busy()"><mat-icon>sync</mat-icon>Sync from Meta</button>
        <button mat-stroked-button (click)="starter()" [disabled]="busy()"><mat-icon>library_add</mat-icon>Submit starter set</button>
      }
      @if (admin()) { <button mat-flat-button (click)="create()"><mat-icon>add</mat-icon>New template</button> }
    </div>
    @if (!demo && !loading() && !tpls().length) { <div class="banner info"><mat-icon>info</mat-icon><div class="small">No templates yet. <b>Sync from Meta</b> imports the templates in your WhatsApp Business Account; <b>Submit starter set</b> sends K3’s admission templates to Meta for approval (minutes to 24 h).</div></div> }
    <mat-chip-listbox [value]="filter()" (change)="filter.set($event.value || 'all')" style="margin-bottom:16px" aria-label="Status filter">
      @for (k of filters; track k) {<mat-chip-option [value]="k">{{ k === 'all' ? 'All' : k }} · {{ k === 'all' ? tpls().length : countOf(k) }}</mat-chip-option>}
    </mat-chip-listbox>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    <div class="grid g-3">
      @for (t of list(); track t.id) {
        <div class="tpl">
          <div class="row"><span class="nm grow mono ellipsis" [title]="t.name">{{ t.name }}</span><span class="pill {{ sp[t.status] }}">{{ t.status }}</span></div>
          <div class="row small muted"><mat-icon class="sm">{{ hi[t.header] || 'notes' }}</mat-icon><span>{{ t.category }} · {{ t.language }}</span></div>
          <div class="body">{{ t.body }}</div>
          @if (t.status === 'Rejected') { <div class="small" style="color:var(--mat-sys-error)"><mat-icon class="sm" style="vertical-align:-3px">error</mat-icon> {{ t.rejectReason }}</div> }
          @else {
            <div class="row small muted"><span>{{ num(t.sent) }} sent</span><span>·</span><span>{{ t.sent ? pct(t.readRate) + ' read' : '—' }}</span><span class="grow"></span>
              @if (vars(t)) {<button mat-button (click)="mapVars(t)" matTooltip="Map template variables"><mat-icon>data_object</mat-icon>{{ hasMap(t) ? 'Variables ✓' : 'Variables (' + vars(t) + ')' }}</button>}
              @if (t.status === 'Approved') {<button mat-icon-button (click)="broadcast(t)" matTooltip="Broadcast this template"><mat-icon>campaign</mat-icon></button>}
            </div>
          }
        </div>
      } @empty { @if (!loading()) {<div class="empty"><mat-icon>article</mat-icon><p>No templates in this view</p></div>} }
    </div>
  </div>`,
  styles: [`.tpl{background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:8px;min-width:0}
    .nm{font:var(--mat-sys-title-small)} .body{font:var(--mat-sys-body-medium);background:var(--k3-wa-bg);border-radius:12px;padding:10px 12px;white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden;flex:1}`],
})
export class TemplatesPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private router = inject(Router);
  demo = environment.demo; num = num; pct = pct; vars = (t: any) => t.vars ?? varCount(t.body); hasMap = (t: any) => (t.varMap || []).some(Boolean);
  sp: Record<string, string> = { Approved: 'p-ok', Pending: 'p-pend', Rejected: 'p-bad', Paused: 'p-grey', Disabled: 'p-grey' };
  hi: Record<string, string> = { none: 'notes', image: 'image', video: 'movie', document: 'picture_as_pdf' };
  filters = ['all', 'Approved', 'Pending', 'Rejected'];
  tpls = signal<any[]>([]); loading = signal(true); busy = signal(false); filter = signal('all');
  admin = computed(() => this.demo || this.s.role() === 'admin');
  list = computed(() => this.tpls().filter(t => this.filter() === 'all' || t.status === this.filter()));
  countOf = (k: string) => this.tpls().filter(t => t.status === k).length;
  constructor() { this.load(); }
  async load() { try { this.tpls.set(await this.api.templates()); } catch (e) { this.ui.error(e); } this.loading.set(false); }
  async sync() { this.busy.set(true); try { const r = await this.api.syncTemplates(); this.ui.toast(`Synced ${r.synced} templates from Meta`); await this.load(); } catch (e) { this.ui.error(e); } this.busy.set(false); }
  async starter() {
    this.busy.set(true);
    try { const r = await this.api.recommendedTemplates(); const ok = r.results.filter((x: any) => x.ok).length; const bad = r.results.filter((x: any) => !x.ok);
      await this.ui.confirm('Starter templates submitted', `${ok} of ${r.results.length} submitted to Meta for approval.${bad.length ? '\n\n' + bad.map((b: any) => `${b.name}: ${b.error}`).join('\n') : ''}\n\nApproval updates arrive automatically via webhook, or use Sync from Meta.`, 'OK', 'library_add');
      await this.load();
    } catch (e) { this.ui.error(e); } this.busy.set(false);
  }
  create() { this.ui.open(NewTemplateDialog, null, { width: '720px' }).afterClosed().subscribe(ok => ok && this.load()); }
  mapVars(t: any) { this.ui.open(VarsDialog, t, { width: '640px' }).afterClosed().subscribe(ok => ok && this.load()); }
  broadcast(t: any) { BroadcastDraft.set({ template: t.name }); this.router.navigateByUrl('/broadcasts/new'); }
}
