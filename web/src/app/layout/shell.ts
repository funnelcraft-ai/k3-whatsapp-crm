/* App frame: M3 top app bar + navigation drawer / rail / modal drawer, banners, global search */
import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { Api } from '../core/api.service';
import { Session } from '../core/session.service';
import { Ui } from '../core/ui.service';
import { debounce } from '../core/util';
import { environment } from '../../environments/environment';
import { Avatar, TempPill } from '../shared/bits';
import { LeadNav } from '../shared/lead-nav';
import { NewLeadDialog } from '../pages/leads-dialogs';
import { PasswordDialog } from './password-dialog';

type NavItem = { path: string; icon: string; label: string; badge?: 'inbox' | 'followups'; section?: string };
const CRM_NAV: NavItem[] = [
  { path: '/home', icon: 'home', label: 'Home' }, { path: '/leads', icon: 'groups', label: 'Leads' },
  { path: '/inbox', icon: 'forum', label: 'Inbox', badge: 'inbox' }, { path: '/followups', icon: 'event_upcoming', label: 'Follow-ups', badge: 'followups' },
  { path: '/nurture', icon: 'conversion_path', label: 'Nurture', section: 'Automation' }, { path: '/broadcasts', icon: 'campaign', label: 'Broadcasts' },
  { path: '/templates', icon: 'article', label: 'Templates' }, { path: '/ai-qualifier', icon: 'auto_awesome', label: 'AI Qualifier' },
  { path: '/reports', icon: 'monitoring', label: 'Reports', section: 'Insights' },
];
const PLATFORM_NAV: NavItem[] = [
  { path: '/platform/institutions', icon: 'domain', label: 'Institutions' }, { path: '/platform/plans', icon: 'sell', label: 'Plans' },
  { path: '/platform/payments', icon: 'receipt_long', label: 'Payments' }, { path: '/platform/backups', icon: 'backup', label: 'Backups' },
  { path: '/platform/company', icon: 'business', label: 'Company & keys', section: 'Settings' }, { path: '/platform/admins', icon: 'admin_panel_settings', label: 'Platform admins' }, { path: '/platform/security', icon: 'shield', label: 'My security' },
];

@Component({
  selector: 'k3-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, MatSidenavModule, MatToolbarModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatTooltipModule, MatAutocompleteModule, MatDividerModule, Avatar, TempPill],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  s = inject(Session); private api = inject(Api); private ui = inject(Ui); private router = inject(Router); private nav = inject(LeadNav);
  private bp = inject(BreakpointObserver);
  demo = environment.demo;
  mode = toSignal(this.bp.observe(['(min-width: 1280px)', '(min-width: 861px)']).pipe(map(r => r.breakpoints['(min-width: 1280px)'] ? 'full' : r.breakpoints['(min-width: 861px)'] ? 'rail' : 'modal')), { initialValue: 'full' as const });
  drawerOpen = signal(false); searching = signal(false); results = signal<any[]>([]); q = '';
  url = toSignal(this.router.events.pipe(filter(e => e instanceof NavigationEnd), map(e => (e as NavigationEnd).urlAfterRedirects)), { initialValue: this.router.url });
  items = computed<NavItem[]>(() => {
    if (this.s.platformOnly()) return PLATFORM_NAV;
    const extra: NavItem[] = [];
    if (this.s.role() === 'admin' && !this.demo) extra.push({ path: '/settings', icon: 'settings', label: 'Settings', section: 'Admin' });
    if (this.demo) extra.push({ path: '/settings', icon: 'settings', label: 'Settings', section: 'Admin' }, { path: '/api', icon: 'api', label: 'API & Integrations' });
    return [...CRM_NAV, ...extra];
  });
  isRail = computed(() => this.mode() === 'rail');
  userName = computed(() => this.s.me()?.user?.name || 'User');
  billing = computed(() => {
    const t = this.s.me()?.tenant; if (!t || this.s.platformOnly() || this.demo) return null;
    if (t.billingLocked) return { cls: 'err', icon: 'lock', text: 'Your subscription has ended. Renew to restore access to the CRM — your data is safe.', cta: 'Renew now' };
    if (!t.accessUntil) return null;
    const days = Math.ceil((new Date(t.accessUntil).getTime() - Date.now()) / 864e5);
    if (t.billingStatus === 'trial') return { cls: days <= 7 ? 'warn' : 'info', icon: 'hourglass_bottom', text: `Free trial · ${days} day${days === 1 ? '' : 's'} left. Choose a plan any time to keep WhatsApp automations running without interruption.`, cta: 'Choose plan' };
    if (['past_due', 'halted', 'pending'].includes(t.billingStatus)) return { cls: 'warn', icon: 'credit_card_off', text: `Payment issue — access continues until ${new Date(t.accessUntil).toLocaleDateString('en-IN')}. Update your payment method.`, cta: 'Fix billing' };
    return null;
  });

  constructor() { this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => { this.drawerOpen.set(false); this.s.refreshBadges(); }); }
  badge(i: NavItem) { return i.badge ? this.s.badges()[i.badge] || 0 : 0; }
  toggleNav() { this.drawerOpen.update(v => !v); }
  newLead() { this.ui.open(NewLeadDialog, null, { width: '640px' }).afterClosed().subscribe(l => { if (l && this.url().startsWith('/leads')) this.router.navigate(['/leads'], { queryParams: { r: Date.now() } }); }); }
  search = debounce(async (q: string) => { if (!q || q.length < 2) { this.results.set([]); return; } try { this.results.set((await this.api.leads({ q })).slice(0, 8)); } catch { this.results.set([]); } }, 200);
  pickResult(l: any) { this.q = ''; this.results.set([]); this.searching.set(false); this.nav.open(l.id); }
  password() { this.ui.open(PasswordDialog, null, { width: '420px' }); }
  logout() { this.s.logout(); }
  async endSupport() { this.s.setImp(null); this.s.ready.set(false); await this.s.init(); this.router.navigateByUrl('/platform/institutions'); }
}
