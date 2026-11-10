import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { STAGES, STAGE_LABEL, TEMP, debounce, fillTemplate, num, timeOf } from '../core/util';
import { BroadcastDraft } from './broadcast-draft';

function creativeSVG(title: string, sub: string, c1: string, c2: string, emoji: string) {
  const x = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="680" cy="90" r="160" fill="#fff" opacity=".08"/><circle cx="90" cy="420" r="120" fill="#fff" opacity=".07"/><text x="60" y="120" font-family="Arial, sans-serif" font-size="80">${emoji}</text><text x="60" y="230" font-family="Arial, sans-serif" font-weight="700" font-size="54" fill="#fff">${x(title)}</text><text x="60" y="290" font-family="Arial, sans-serif" font-size="28" fill="#fff" opacity=".9">${x(sub)}</text><rect x="60" y="335" rx="28" width="250" height="56" fill="#fff"/><text x="185" y="372" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="22" fill="${c2}">Book a visit →</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
/* WhatsApp accepts JPG/PNG only — render starter SVG creatives to PNG before upload */
function svgToPng(url: string, name: string): Promise<File> {
  return new Promise((res, rej) => { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = 1200; c.height = 675; c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height); c.toBlob(b => b ? res(new File([b], name, { type: 'image/png' })) : rej(new Error('Could not render creative')), 'image/png'); }; img.onerror = () => rej(new Error('Could not render creative')); img.src = url; });
}
const SAMPLES = () => [
  { type: 'image', name: 'open-house.png', url: creativeSVG('Open House 2027', 'Saturday · 10 AM · Main Campus', '#1a5fb4', '#0b3d91', '🏫') },
  { type: 'image', name: 'early-bird.png', url: creativeSVG('10% off admission fee', 'Apply before 30 November', '#8e3fd6', '#5b1ea0', '🎓') },
  { type: 'image', name: 'results.png', url: creativeSVG('100% Board Results', '42 students scored 95%+', '#1e8e3e', '#0d652d', '🏆') },
  { type: 'image', name: 'stem-lab.png', url: creativeSVG('New STEM & Robotics Lab', 'See it live at the campus tour', '#e37400', '#a05a00', '🤖') },
];

@Component({
  selector: 'k3-broadcast-new',
  imports: [RouterLink, FormsModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonToggleModule, MatProgressBarModule],
  template: `
  <div class="page">
    <div class="page-head"><a mat-icon-button routerLink="/broadcasts" aria-label="Back"><mat-icon>arrow_back</mat-icon></a>
      <div><h1>New WhatsApp broadcast</h1><div class="sub">Pick an audience, a Meta-approved template and your creative</div></div></div>
    @if (loading()) { <mat-progress-bar mode="indeterminate" /> }
    @else if (!approved().length) {
      <div class="empty"><mat-icon>article</mat-icon><h3>No approved templates yet</h3><p>Broadcasts use Meta-approved WhatsApp templates.</p><a mat-flat-button routerLink="/templates">Go to Templates</a></div>
    } @else {
    <div class="composer-wrap">
      <div class="col" style="gap:12px;min-width:0">
        <section class="stepcard"><h4><span class="n">1</span>Campaign</h4>
          <mat-form-field class="full" subscriptSizing="dynamic"><mat-label>Campaign name</mat-label><input matInput [(ngModel)]="name" placeholder="e.g. Open House – December"></mat-form-field></section>
        <section class="stepcard"><h4><span class="n">2</span>Audience</h4>
          @if (seg().leadIds?.length) { <div class="lab">Hand-picked</div><mat-chip-set><mat-chip (removed)="clearIds()" highlighted>{{ seg().leadIds.length }} selected leads<button matChipRemove aria-label="Remove"><mat-icon>cancel</mat-icon></button></mat-chip></mat-chip-set> }
          @for (grp of groups(); track grp.key) {
            <div class="lab">{{ grp.label }}</div>
            <mat-chip-listbox multiple [value]="seg()[grp.key]" (change)="setSeg(grp.key, $event.value)" [attr.aria-label]="grp.label">
              @for (o of grp.items; track o[0]) {<mat-chip-option [value]="o[0]">{{ o[1] }}</mat-chip-option>}
            </mat-chip-listbox>
          }
          <div class="audience-box"><mat-icon>groups</mat-icon><div class="grow"><div class="big">{{ count() == null ? '…' : num(count()!) }}</div><div class="small muted">parents will receive this message · opted-out contacts are excluded automatically</div></div></div>
        </section>
        <section class="stepcard"><h4><span class="n">3</span>Message template</h4>
          <mat-form-field class="full"><mat-label>Template</mat-label><mat-select [(ngModel)]="tplId">@for (t of approved(); track t.id) {<mat-option [value]="t.id">{{ t.name }} · {{ t.category }}@if (t.header && t.header !== 'none') { · {{ t.header }} header}</mat-option>}</mat-select></mat-form-field>
          <div class="small muted">Variables are filled per parent using each template’s variable mapping (Templates → Variables).@if (pending()) { {{ pending() }} pending template(s) become available once Meta approves them.}</div>
        </section>
        <section class="stepcard"><h4><span class="n">4</span>Creative</h4>
          <div class="dropzone" [class.over]="over()" (click)="file.click()" (dragover)="$event.preventDefault(); over.set(true)" (dragleave)="over.set(false)" (drop)="drop($event)">
            <mat-icon>cloud_upload</mat-icon><div><b>Upload image, video or PDF</b></div><div class="small muted">JPG / PNG up to 5 MB · MP4 up to 16 MB · PDF up to 100 MB — or drop a file here</div></div>
          <input #file type="file" hidden accept="image/jpeg,image/png,video/mp4,application/pdf" (change)="pick($event)">
          <div class="creatives">
            @for (c of samples; track c.name) { <img [src]="c.url" [class.on]="creative() === c" (click)="creative.set(c)" [alt]="c.name" [title]="c.name"> }
            @if (creative() && !samples.includes(creative())) { <span class="pill p-blue"><mat-icon>attach_file</mat-icon>{{ creative().name }}</span> }
            <button mat-stroked-button (click)="creative.set(null)"><mat-icon>hide_image</mat-icon>No creative</button>
          </div>
        </section>
        <section class="stepcard"><h4><span class="n">5</span>Schedule</h4>
          <div class="row wrap">
            <mat-button-toggle-group [(ngModel)]="when" hideSingleSelectionIndicator><mat-button-toggle value="now"><mat-icon>send</mat-icon> Send now</mat-button-toggle><mat-button-toggle value="later"><mat-icon>schedule</mat-icon> Schedule</mat-button-toggle></mat-button-toggle-group>
            @if (when === 'later') { <mat-form-field subscriptSizing="dynamic"><input matInput type="datetime-local" [(ngModel)]="at"></mat-form-field> }
            <span class="small muted">Messages are throttled to respect your WhatsApp tier limit.</span>
          </div>
        </section>
        <div class="row wrap" style="justify-content:flex-end">
          <a mat-button routerLink="/broadcasts">Cancel</a>
          <button mat-stroked-button (click)="save(true)" [disabled]="busy()"><mat-icon>draft</mat-icon>Save draft</button>
          <button mat-flat-button (click)="save(false)" [disabled]="busy()"><mat-icon>{{ when === 'now' ? 'send' : 'schedule_send' }}</mat-icon>{{ when === 'now' ? 'Send broadcast' : 'Schedule broadcast' }}</button>
        </div>
      </div>
      <div class="preview-col">
        <div class="phone"><div class="scr">
          <div class="wa-h"><img src="k3-logo.png" alt=""><div><div style="font:var(--mat-sys-title-small)">{{ s.meta().institution?.name }}</div><div style="font-size:11px;opacity:.85">Business account ✓</div></div></div>
          <div class="msgs"><div class="daysep">Today</div>
            <div class="bub in" style="max-width:92%">@if (creative()) { @if (creative().type === 'image') {<img [src]="creative().url" alt="">} @else {<div class="doc"><mat-icon>{{ creative().type === 'video' ? 'movie' : 'picture_as_pdf' }}</mat-icon><span class="small">{{ creative().name }}</span></div>} }{{ preview() }}<span class="tm">{{ now }}</span></div>
            @for (b of tpl()?.buttons || []; track b) {<div class="wa-btn"><mat-icon class="sm">reply</mat-icon>{{ b }}</div>}
          </div>
        </div></div>
        <div class="small muted" style="text-align:center;margin-top:10px">Live preview · personalised for a sample parent</div>
      </div>
    </div>
    }
  </div>`,
  styles: [`.composer-wrap{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:20px;align-items:start}
    .stepcard{background:var(--mat-sys-surface);border:1px solid var(--mat-sys-outline-variant);border-radius:20px;padding:16px 18px}
    .stepcard h4{display:flex;align-items:center;gap:10px;margin:0 0 12px;font:var(--mat-sys-title-medium)}
    .stepcard .n{width:26px;height:26px;border-radius:50%;background:var(--mat-sys-primary);color:var(--mat-sys-on-primary);display:grid;place-items:center;font:var(--mat-sys-label-large)}
    .lab{font:var(--mat-sys-label-medium);color:var(--mat-sys-on-surface-variant);margin:10px 0 4px}
    .audience-box{display:flex;gap:12px;align-items:center;margin-top:14px;background:var(--mat-sys-primary-container);color:var(--mat-sys-on-primary-container);border-radius:16px;padding:12px 16px}
    .big{font:var(--mat-sys-headline-small)} .preview-col{position:sticky;top:8px}
    @media (max-width:1100px){.composer-wrap{grid-template-columns:1fr}.preview-col{position:static;display:flex;flex-direction:column;align-items:center}}`],
})
export class BroadcastNewPage {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private router = inject(Router);
  num = num; now = timeOf(new Date()); samples = SAMPLES();
  loading = signal(true); busy = signal(false); over = signal(false); count = signal<number | null>(null);
  tpls = signal<any[]>([]); approved = computed(() => this.tpls().filter(t => t.status === 'Approved')); pending = computed(() => this.tpls().filter(t => t.status === 'Pending').length);
  private draft = BroadcastDraft.take() || {};
  seg = signal<any>(Object.assign({ temps: [], stages: [], programs: [], sources: [] }, this.draft.segment || {}));
  creative = signal<any>(this.samples[0]);
  name = ''; when = 'now'; at = (() => { const d = new Date(Date.now() + 864e5); d.setHours(10, 0, 0, 0); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); })();
  private _tplId = signal<string>(''); get tplId() { return this._tplId(); } set tplId(v: string) { this._tplId.set(v); }
  tpl = computed(() => this.approved().find(t => t.id === this._tplId()));
  preview = computed(() => { const t = this.tpl(); return t ? fillTemplate(t, { parent: 'Moumita Ghosh', student: 'Riya Ghosh', program: this.seg().programs[0] || this.s.meta().programs?.[0] || 'Class 1' }, this.s.meta()) : ''; });
  groups = computed(() => [
    { key: 'temps', label: 'AI temperature', items: ['hot', 'warm', 'cold'].map(t => [t, TEMP[t].label]) },
    { key: 'stages', label: 'Stage', items: STAGES.filter(s => s !== 'admitted').map(s => [s, STAGE_LABEL[s]]) },
    { key: 'programs', label: 'Program / class', items: (this.s.meta().programs || []).map((p: string) => [p, p]) },
    { key: 'sources', label: 'Lead source', items: (this.s.meta().sources || []).map((p: string) => [p, p]) },
  ]);
  constructor() { this.init(); }
  async init() {
    try { const t = await this.api.templates(); this.tpls.set(t); const ok = this.approved(); this._tplId.set((ok.find(x => x.name === this.draft.template) || ok.find(x => x.header === 'image') || ok[0])?.id || ''); }
    catch (e) { this.ui.error(e); }
    this.loading.set(false); this.recount();
  }
  recount = debounce(async () => { try { this.count.set((await this.api.audience(this.seg())).count); } catch { /* */ } }, 200);
  setSeg(k: string, v: string[]) { this.seg.update(s => Object.assign({}, s, { [k]: v || [] })); this.recount(); }
  clearIds() { this.seg.update(s => { const n = Object.assign({}, s); delete n.leadIds; return n; }); this.recount(); }
  drop(e: DragEvent) { e.preventDefault(); this.over.set(false); const f = e.dataTransfer?.files?.[0]; if (f) this.useFile(f); }
  pick(e: Event) { const i = e.target as HTMLInputElement; const f = i.files?.[0]; i.value = ''; if (f) this.useFile(f); }
  async useFile(f: File) {
    const limit = f.type.startsWith('image') ? 5 : f.type.startsWith('video') ? 16 : 100;
    if (f.size > limit * 1048576) { this.ui.toast(`File too large — WhatsApp allows up to ${limit} MB for this type`); return; }
    try { const m = await this.api.upload(f); this.creative.set({ type: m.type === 'application' ? 'document' : m.type, name: m.name || f.name, url: m.url, mediaId: m.id }); this.ui.toast('Creative uploaded'); }
    catch (e) { this.ui.error(e); }
  }
  async save(draft: boolean) {
    const t = this.tpl(); const g = this.seg();
    if (!this.name.trim()) { this.ui.toast('Please name the campaign'); return; }
    if (!this.count()) { this.ui.toast('Your audience is empty — loosen the filters'); return; }
    if (!t) return;
    if (t.header && t.header !== 'none' && !this.creative()) { this.ui.toast(`Template “${t.name}” needs a ${t.header} creative`); return; }
    const later = this.when === 'later';
    if (!draft && later && (!this.at || new Date(this.at).getTime() < Date.now())) { this.ui.toast('Pick a future date and time'); return; }
    this.busy.set(true);
    try {
      let cr = this.creative();
      if (cr && !cr.mediaId) { const m = await this.api.upload(await svgToPng(cr.url, cr.name)); cr = { type: 'image', name: cr.name, url: m.url, mediaId: m.id }; }
      const parts = [g.temps.map((x: string) => TEMP[x].label).join('/'), g.stages.map((x: string) => STAGE_LABEL[x]).join('/'), g.programs.join('/'), g.sources.join('/')].filter(Boolean);
      const bc = await this.api.createBroadcast({ name: this.name.trim(), template: t.name, segment: g, audienceLabel: g.leadIds?.length ? `${g.leadIds.length} hand-picked leads` : parts.join(' · ') || 'All contacts', creative: cr ? { type: cr.type, url: cr.url, name: cr.name, mediaId: cr.mediaId } : null, scheduleAt: !draft && later ? new Date(this.at).toISOString() : null });
      if (!draft && !later) await this.api.sendBroadcast(bc.id);
      this.ui.toast(draft ? 'Draft saved' : later ? `Scheduled for ${new Date(this.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` : `Sending “${this.name}” to ${num(this.count()!)} parents…`);
      this.router.navigateByUrl('/broadcasts');
    } catch (e) { this.ui.error(e); }
    this.busy.set(false);
  }
}
