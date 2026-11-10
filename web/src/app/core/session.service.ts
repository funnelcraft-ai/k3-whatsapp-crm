/* Signed-in user, institution lookups (META), impersonation and realtime events */
import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Api } from './api.service';
import { environment } from '../../environments/environment';

const store = { get: (s: Storage, k: string) => { try { return s.getItem(k); } catch { return null; } }, set: (s: Storage, k: string, v: string | null) => { try { v ? s.setItem(k, v) : s.removeItem(k); } catch { /* blocked */ } } };

@Injectable({ providedIn: 'root' })
export class Session {
  private api = inject(Api); private router = inject(Router);
  private _token = signal<string | null>(store.get(localStorage, 'k3crm-token'));
  private _imp = signal<string | null>(store.get(sessionStorage, 'k3crm-imp'));
  readonly token = computed(() => this._imp() || this._token());
  readonly impersonating = computed(() => !!this._imp());
  readonly me = signal<any>(null);
  readonly meta = signal<any>({ programs: [], sources: [], stages: [], counsellors: [], institution: {}, triggers: [] });
  readonly role = computed(() => this.meta()?.user?.role || this.me()?.role || 'admin');
  readonly platformOnly = computed(() => this.me()?.role === 'super_admin' && !this.me()?.tenant);
  readonly billingLocked = computed(() => !!this.me()?.tenant?.billingLocked);
  readonly ready = signal(false);
  readonly badges = signal<{ inbox: number; followups: number }>({ inbox: 0, followups: 0 });

  // realtime events (SSE in live mode, mock emitter in demo)
  readonly events = new Subject<{ type: string; data: any }>();
  private es: EventSource | null = null;

  setToken(t: string | null) { this._token.set(t); store.set(localStorage, 'k3crm-token', t); }
  setImp(t: string | null) { this._imp.set(t); store.set(sessionStorage, 'k3crm-imp', t); }
  clear() { this.setToken(null); this.setImp(null); this.me.set(null); this.ready.set(false); this.disconnect(); }

  async init(): Promise<boolean> {
    if (environment.demo) {
      this.me.set({ role: 'admin', user: { name: 'Admissions Office', email: 'demo@k3solutions.in', role: 'admin' }, tenant: { name: 'Greenfield Academy' } });
      this.meta.set(await this.api.meta()); this.ready.set(true); this.refreshBadges(); return true;
    }
    if (!this.token()) return false;
    try { this.me.set(await this.api.me()); }
    catch (e: any) { if (this._imp()) { this.setImp(null); return this.init(); } this.clear(); return false; }
    if (this.platformOnly()) this.meta.set({ user: Object.assign({}, this.me().user, { role: 'super_admin' }), institution: { name: 'K3 Solutions' }, programs: [], sources: [], counsellors: [], triggers: [] });
    else { this.meta.set(await this.api.meta()); this.connect(); this.refreshBadges(); }
    this.ready.set(true); return true;
  }
  async reloadMeta() { if (!this.platformOnly()) this.meta.set(await this.api.meta()); }
  async refreshMe() { if (!environment.demo) this.me.set(await this.api.me()); }

  connect() {
    if (environment.demo || !this.token() || typeof EventSource === 'undefined') return;
    this.disconnect();
    this.es = new EventSource(`${environment.apiBase}/events?token=${encodeURIComponent(this.token()!)}`);
    for (const t of ['message', 'status', 'broadcast', 'lead']) this.es.addEventListener(t, (e: any) => { try { this.events.next({ type: t, data: JSON.parse(e.data) }); } catch { /* */ } });
  }
  disconnect() { this.es?.close(); this.es = null; }
  emit(type: string, data: any) { this.events.next({ type, data }); }

  async refreshBadges() {
    if (this.platformOnly() || this.billingLocked()) return;
    try {
      const [convs, fus] = await Promise.all([this.api.conversations(), this.api.followups()]);
      const now = new Date();
      this.badges.set({ inbox: convs.filter(c => c.unread).length, followups: fus.filter(f => !f.done && (new Date(f.due) < now || new Date(f.due).toDateString() === now.toDateString())).length });
    } catch { /* ignore */ }
  }
  logout() { this.clear(); this.router.navigateByUrl('/login'); }
}
