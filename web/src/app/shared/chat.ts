/* WhatsApp-style conversation pane (used in the inbox and the lead side sheet) */
import { Component, DestroyRef, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { fillTemplate, isToday, timeOf } from '../core/util';
import { Avatar, TempPill } from './bits';

@Component({
  selector: 'k3-template-pick',
  imports: [MatDialogModule, MatButtonModule, MatRadioModule, FormsModule, MatIconModule],
  template: `<h2 mat-dialog-title>Send WhatsApp template</h2>
  <mat-dialog-content>
    <p class="muted small" style="margin-top:0">Approved templates can be sent anytime — even outside the 24-hour customer-care window.</p>
    @if (!data.templates.length) { <div class="empty">No approved templates yet. Create or sync them in Templates.</div> }
    <mat-radio-group [(ngModel)]="pick" class="col" style="gap:6px">
      @for (t of data.templates; track t.id) {
        <label class="list-item" style="align-items:flex-start">
          <mat-radio-button [value]="t" />
          <div class="meta"><div class="name mono" style="font-size:13px">{{ t.name }} <span class="pill p-grey">{{ t.category }}</span>@if (t.header && t.header !== 'none') { <span class="pill p-blue">{{ t.header }} header</span> }</div>
            <div class="small muted" style="white-space:pre-wrap">{{ preview(t) }}</div></div>
        </label>
      }
    </mat-radio-group>
  </mat-dialog-content>
  <mat-dialog-actions align="end"><button mat-button mat-dialog-close>Cancel</button><button mat-flat-button [disabled]="!pick" [mat-dialog-close]="pick"><mat-icon>send</mat-icon>Send</button></mat-dialog-actions>`,
})
export class TemplatePick {
  data = inject<any>(MAT_DIALOG_DATA); private s = inject(Session); pick: any = this.data.templates[0];
  preview(t: any) { const p = fillTemplate(t, this.data.lead, this.s.meta()); return p.length > 160 ? p.slice(0, 158) + '…' : p; }
}

@Component({
  selector: 'k3-chat',
  imports: [FormsModule, MatIconModule, MatButtonModule, MatTooltipModule, Avatar, TempPill],
  template: `
  <div class="chat">
    @if (header()) {
      <div class="chat-h">
        <button mat-icon-button class="back-btn" (click)="back.emit()" aria-label="Back"><mat-icon>arrow_back</mat-icon></button>
        <k3-avatar [name]="lead().parent" size="md" />
        <div class="grow" style="min-width:0"><div class="title-s ellipsis">{{ lead().parent }}</div><div class="small muted ellipsis">{{ lead().phone }} · {{ lead().program }}</div></div>
        <k3-temp [temp]="lead().ai?.temp" [score]="lead().ai?.score" class="hide-xs" />
        <button mat-icon-button matTooltip="Open lead" (click)="openLead.emit(lead().id)"><mat-icon>open_in_new</mat-icon></button>
      </div>
    }
    <div class="msgs" #msgs>
      @if (loading()) { <div class="empty small">Loading conversation…</div> }
      @for (m of messages(); track m.id; let i = $index) {
        @if (i === 0 || day(m.at) !== day(messages()[i - 1].at)) { <div class="daysep">{{ dayLabel(m.at) }}</div> }
        <div class="bub" [class.out]="m.from !== 'lead'" [class.in]="m.from === 'lead'">
          @if (m.from === 'bot') { <div class="tag"><mat-icon>smart_toy</mat-icon>Auto-reply@if (m.template) { · {{ m.template }}}</div> }
          @else if (m.type === 'template') { <div class="tag"><mat-icon>article</mat-icon>Template · {{ m.template }}</div> }
          @else if (m.type === 'broadcast') { <div class="tag"><mat-icon>campaign</mat-icon>Broadcast</div> }
          @if (m.media) { @if (m.media.type === 'image') { <img [src]="m.media.url" alt=""> } @else { <div class="doc"><mat-icon>{{ m.media.type === 'video' ? 'movie' : 'picture_as_pdf' }}</mat-icon><span class="small">{{ m.media.name || 'Attachment' }}</span></div> } }
          {{ m.text }}
          @if (m.status === 'failed' && m.error) { <div class="small" style="color:var(--k3-bad);margin-top:4px">{{ m.error }}</div> }
          <span class="tm">{{ time(m.at) }}
            @if (m.from !== 'lead') {
              @switch (m.status) {
                @case ('failed') { <mat-icon style="color:var(--k3-bad)" [matTooltip]="m.error || 'Failed'">error</mat-icon> }
                @case ('read') { <mat-icon class="read">done_all</mat-icon> }
                @case ('delivered') { <mat-icon>done_all</mat-icon> }
                @case ('sent') { <mat-icon>done</mat-icon> }
                @default { <mat-icon>schedule</mat-icon> }
              }
            }
          </span>
        </div>
      }
    </div>
    <div class="suggest">
      @if (ai()) { <button (click)="use(ai()!.msg)" [title]="ai()!.msg"><mat-icon>auto_awesome</mat-icon><b>AI · {{ ai()!.intent }}:</b>&nbsp;{{ short(ai()!.msg) }}</button> }
      @for (q of quick(); track q[1]) { <button (click)="use(q[2])"><mat-icon>{{ q[0] }}</mat-icon>{{ q[1] }}</button> }
    </div>
    @if (attach()) {
      <div class="attach-prev">@if (attach().type === 'image') { <img [src]="attach().url" alt=""> } @else { <mat-icon>{{ attach().type === 'video' ? 'movie' : 'description' }}</mat-icon> }
        <span class="grow ellipsis">{{ attach().name }}</span><button mat-icon-button (click)="attach.set(null)" aria-label="Remove attachment"><mat-icon>close</mat-icon></button></div>
    }
    <div class="composer">
      <button mat-icon-button matTooltip="Send template" (click)="sendTemplate()" [disabled]="lead().optedOut"><mat-icon>article</mat-icon></button>
      <button mat-icon-button matTooltip="Attach creative" (click)="file.click()" [disabled]="blocked()"><mat-icon>attach_file</mat-icon></button>
      <input #file type="file" hidden accept="image/*,video/*,application/pdf" (change)="onFile($event)">
      <textarea #ta rows="1" [(ngModel)]="text" [disabled]="blocked()" (keydown.enter)="enter($event)" (input)="grow()"
        [placeholder]="lead().optedOut ? 'Contact opted out of WhatsApp' : windowOpen() ? 'Type a message' : 'Chat window closed · send a template'"></textarea>
      <button mat-mini-fab class="send-btn" aria-label="Send" (click)="send()" [disabled]="blocked() || (!text.trim() && !attach())"><mat-icon class="fill">send</mat-icon></button>
    </div>
  </div>`,
  styles: [`:host{display:flex;flex-direction:column;min-height:0;height:100%}
    .chat-h{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--mat-sys-surface);border-bottom:1px solid var(--mat-sys-outline-variant)}
    .title-s{font:var(--mat-sys-title-small)}
    .attach-prev{display:flex;align-items:center;gap:10px;padding:6px 12px;background:#f0f2f5;font:var(--mat-sys-body-small)} .attach-prev img{width:44px;height:44px;object-fit:cover;border-radius:6px}
    .send-btn{background:var(--k3-wa)!important;color:#fff!important;flex:none} .send-btn[disabled]{opacity:.5}
    .back-btn{display:none} @media (max-width:860px){.back-btn{display:inline-flex}} @media (max-width:420px){.hide-xs{display:none}}`],
})
export class Chat {
  private api = inject(Api); private s = inject(Session); private ui = inject(Ui);
  lead = input.required<any>(); header = input(true);
  back = output<void>(); openLead = output<string>(); sent = output<any>();
  messages = signal<any[]>([]); loading = signal(true); attach = signal<any>(null);
  ai = signal<{ intent: string; msg: string } | null>(null); windowOpen = signal(true);
  text = '';
  private box = viewChild<ElementRef<HTMLDivElement>>('msgs'); private ta = viewChild<ElementRef<HTMLTextAreaElement>>('ta');
  time = timeOf; day = (a: string) => new Date(a).toDateString();
  dayLabel = (a: string) => isToday(a) ? 'Today' : new Date(a).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  short = (m: string) => m.length > 60 ? m.slice(0, 58) + '…' : m;
  blocked = () => !!this.lead().optedOut || !this.windowOpen();
  quick = () => [['payments', 'Share fee structure', 'Sharing the fee structure for ' + this.lead().program + ' 📄 Early-bird waiver of 10% is valid till 30 Nov.'], ['apartment', 'Book campus visit', 'Would you like to visit our campus? Tours run Mon–Sat, 10 AM–1 PM. Shall I book Saturday 11 AM?']];

  constructor() {
    effect(() => { const l = this.lead(); this.windowOpen.set(l.windowOpen !== false); this.load(l.id); });
    const sub = this.s.events.subscribe(({ type, data }) => {
      if (type === 'message' && data.leadId === this.lead().id) {
        if (this.messages().some(m => m.id === data.message.id)) return;
        this.messages.update(a => [...a, data.message]); this.scroll();
        if (data.message.from === 'lead') { if (!this.lead().optedOut) this.windowOpen.set(true); this.suggest(); }
      }
      if (type === 'status') this.messages.update(a => a.map(m => m.id === data.messageId || m.wamid === data.wamid ? Object.assign({}, m, { status: data.status, error: data.error }) : m));
    });
    inject(DestroyRef).onDestroy(() => sub.unsubscribe());
  }
  async load(id: string) {
    this.loading.set(true); this.ai.set(null);
    try { this.messages.set(await this.api.messages(id)); } catch (e) { this.ui.error(e); }
    this.loading.set(false); this.scroll(); this.suggest(); this.s.refreshBadges();
  }
  async suggest() {
    const lastIn = [...this.messages()].reverse().find(m => m.from === 'lead'); if (!lastIn) return;
    try { const c = await this.api.classify(lastIn.text); this.ai.set({ intent: c.intent, msg: String(c.suggestedReply || '').replace('{{program}}', this.lead().program) }); } catch { /* optional */ }
  }
  scroll() { setTimeout(() => { const b = this.box()?.nativeElement; if (b) b.scrollTop = b.scrollHeight; }); }
  use(m: string) { this.text = m; setTimeout(() => { this.ta()?.nativeElement.focus(); this.grow(); }); }
  grow() { const t = this.ta()?.nativeElement; if (t) { t.style.height = 'auto'; t.style.height = Math.min(120, t.scrollHeight) + 'px'; } }
  enter(e: Event) { const k = e as KeyboardEvent; if (!k.shiftKey) { k.preventDefault(); this.send(); } }
  async onFile(e: Event) {
    const inp = e.target as HTMLInputElement; const f = inp.files?.[0]; inp.value = ''; if (!f) return;
    try { const m = await this.api.upload(f); this.attach.set(Object.assign({ name: f.name }, m)); } catch (err) { this.ui.error(err); }
  }
  async send(extra?: any) {
    const text = extra ? extra.text : this.text.trim(); const att = this.attach();
    if (!text && !att) return;
    const payload = extra || { type: att ? 'media' : 'text', text, media: att || undefined };
    if (!extra) this.text = ''; this.attach.set(null); setTimeout(() => this.grow());
    try {
      const m = await this.api.send(this.lead().id, payload);
      if (!this.messages().some(x => x.id === m.id)) this.messages.update(a => [...a, m]);
      this.scroll(); this.sent.emit(m);
    } catch (e) { this.ui.error(e); if (text && !extra) this.text = text; }
  }
  async sendTemplate() {
    const tpls = (await this.api.templates()).filter(t => t.status === 'Approved');
    this.ui.open<any>(TemplatePick, { templates: tpls, lead: this.lead() }, { width: '600px' }).afterClosed().subscribe((t: any) => {
      if (!t) return;
      const hasHeader = t.header && t.header !== 'none';
      if (hasHeader && !this.attach()) { this.ui.toast(`“${t.name}” has a ${t.header} header — attach a creative first (📎), then send the template.`); return; }
      this.send({ type: 'template', template: t.name, text: fillTemplate(t, this.lead(), this.s.meta()), media: hasHeader ? this.attach() : undefined });
    });
  }
}
