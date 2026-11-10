/* Small presentational building blocks used across screens */
import { Component, ElementRef, OnDestroy, AfterViewInit, computed, effect, inject, input, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Session } from '../core/session.service';
import { STAGE_COLOR, STAGE_LABEL, TEMP, hashColor, initials, pct } from '../core/util';
import { Charts } from './charts-core';

@Component({
  selector: 'k3-avatar', standalone: true,
  template: `<span class="avatar {{ size() }}" [style.background]="color() || bg()" [title]="name()">{{ ini() }}</span>`,
  host: { style: 'display:inline-flex' },
})
export class Avatar {
  name = input<string>(''); size = input<string>(''); color = input<string | undefined>();
  ini = computed(() => initials(this.name())); bg = computed(() => hashColor(this.name()));
}

@Component({
  selector: 'k3-owner', standalone: true,
  template: `<span class="avatar sm" [style.background]="c().color" [title]="c().name">{{ c().initials }}</span>`,
  host: { style: 'display:inline-flex' },
})
export class Owner {
  private s = inject(Session); id = input<string | null | undefined>();
  c = computed(() => this.s.meta().counsellors?.find((x: any) => x.id === this.id()) || { name: 'Unassigned', initials: '–', color: '#9aa0a6' });
}

@Component({
  selector: 'k3-temp', standalone: true, imports: [MatIconModule],
  template: `@if (t()) {<span class="pill {{ t()!.cls }}"><mat-icon class="fill">{{ t()!.icon }}</mat-icon>{{ t()!.label }}@if (score() != null) { · {{ score() }}}</span>}`,
  host: { style: 'display:inline-flex' },
})
export class TempPill { temp = input<string>(); score = input<number | null>(); t = computed(() => TEMP[this.temp() || '']); }

@Component({
  selector: 'k3-stage', standalone: true,
  template: `<span class="stage"><i [style.background]="color()"></i>{{ label() }}</span>`,
  host: { style: 'display:inline-flex' },
})
export class StageTag { stage = input<string>(''); color = computed(() => STAGE_COLOR[this.stage()]); label = computed(() => STAGE_LABEL[this.stage()] || this.stage()); }

@Component({
  selector: 'k3-score', standalone: true, imports: [TempPill],
  template: `<div class="scorebar"><k3-temp [temp]="temp()" /><div class="bar"><i [style.width.%]="score()" [style.background]="color()"></i></div><span class="small muted tnum">{{ score() }}</span></div>`,
})
export class ScoreBar { score = input(0); temp = input<string>('cold'); color = computed(() => TEMP[this.temp()]?.color); }

@Component({
  selector: 'k3-kpi', standalone: true, imports: [MatIconModule],
  template: `<div class="kpi"><div class="lbl"><mat-icon>{{ icon() }}</mat-icon>{{ label() }}</div><div class="val">{{ value() }}</div><div class="delta {{ cls() }}">{{ delta() }}</div></div>`,
})
export class Kpi { icon = input(''); label = input(''); value = input<any>(''); delta = input(''); cls = input(''); }

@Component({
  selector: 'k3-temp-mix', standalone: true,
  template: `<div class="segbar">@for (k of keys; track k) {<div [style.flex]="mix()[k] || 0.0001" [style.background]="T[k].color" [title]="T[k].label + ': ' + mix()[k]">{{ share(k) }}</div>}</div>
    <div class="legend">@for (k of keys; track k) {<span><i class="sw" [style.background]="T[k].color"></i>{{ T[k].label }} <b class="tnum">{{ mix()[k] }}</b></span>}</div>`,
})
export class TempMix {
  mix = input<any>({ hot: 0, warm: 0, cold: 0 }); keys = ['hot', 'warm', 'cold']; T = TEMP;
  share(k: string) { const m = this.mix(); const tot = (m.hot + m.warm + m.cold) || 1; return m[k] / tot > 0.08 ? pct(m[k] / tot) : ''; }
}

@Component({ selector: 'k3-legend', standalone: true, template: `<div class="legend">@for (s of items(); track s.name) {<span><i class="sw" [style.background]="s.color"></i>{{ s.name }}</span>}</div>` })
export class Legend { items = input<{ name: string; color: string }[]>([]); }

/* SVG chart host — redraws on data or width change */
@Component({ selector: 'k3-chart', standalone: true, template: `<div #host class="chart"></div>`, host: { style: 'display:block' } })
export class Chart implements AfterViewInit, OnDestroy {
  kind = input<'line' | 'bars'>('line'); opts = input<any>(null);
  private host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private ro?: ResizeObserver; private w = 0; private ready = false;
  constructor() { effect(() => { this.opts(); if (this.ready) this.draw(); }); }
  ngAfterViewInit() {
    this.ready = true; this.draw();
    this.ro = new ResizeObserver(() => { const w = this.host().nativeElement.clientWidth; if (Math.abs(w - this.w) > 24) this.draw(); });
    this.ro.observe(this.host().nativeElement);
  }
  draw() { const o = this.opts(); const el = this.host().nativeElement; if (!o) return; this.w = el.clientWidth; (Charts as any)[this.kind()](el, o); }
  ngOnDestroy() { this.ro?.disconnect(); }
}

export const BITS = [Avatar, Owner, TempPill, StageTag, ScoreBar, Kpi, TempMix, Legend, Chart];
