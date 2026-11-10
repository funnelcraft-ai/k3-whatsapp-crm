/* Demo build only: route on plain "#name" hashes (e.g. #leads, #settings-billing) instead of "#/path?query",
   because the artifact host only syncs simple hash names with the page URL. Query params are kept in memory. */
import { Injectable } from '@angular/core';
import { HashLocationStrategy } from '@angular/common';

/* claude.ai reserves a few bare names (settings, sidebar…) — map those to a sub-page name */
const RESERVED: Record<string, string> = { settings: 'settings-whatsapp', platform: 'platform-institutions' };
const toName = (url: string) => { const p = url.split('?')[0].replace(/^\/+|\/+$/g, ''); const n = p ? p.replace(/\//g, '-') : 'home'; return RESERVED[n] || n; };
const fromName = (name: string) => {
  if (!name) return '/home';
  if (name === 'broadcasts-new') return '/broadcasts/new';
  if (/^(settings|platform)-/.test(name)) return '/' + name.replace('-', '/');
  return '/' + name;
};

@Injectable()
export class DemoHashLocation extends HashLocationStrategy {
  private memo = '';
  override path(): string {
    const name = decodeURIComponent((window.location.hash || '').replace(/^#\/?/, ''));
    if (this.memo && toName(this.memo) === name) return this.memo;
    return name.includes('/') ? '/' + name.replace(/^\/+/, '') : fromName(name);
  }
  override prepareExternalUrl(internal: string): string { return '#' + toName(internal); }
  override pushState(state: any, title: string, url: string, queryParams: string): void { this.memo = url + (queryParams ? (queryParams.startsWith('?') ? '' : '?') + queryParams : ''); super.pushState(state, title, url, ''); }
  override replaceState(state: any, title: string, url: string, queryParams: string): void { this.memo = url + (queryParams ? (queryParams.startsWith('?') ? '' : '?') + queryParams : ''); super.replaceState(state, title, url, ''); }
}
