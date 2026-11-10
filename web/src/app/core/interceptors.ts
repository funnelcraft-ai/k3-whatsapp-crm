import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';
import { Session } from './session.service';

/* adds the Bearer token, turns server errors into readable Error messages, handles 401/402 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const s = inject(Session); const router = inject(Router);
  const t = s.token();
  const r = t ? req.clone({ setHeaders: { Authorization: 'Bearer ' + t } }) : req;
  return next(r).pipe(catchError((e: HttpErrorResponse) => {
    const msg = (e.error && (e.error.error || e.error.message)) || (e.status === 0 ? 'Network error — check your connection' : `Request failed (${e.status})`);
    if (e.status === 401 && !req.url.endsWith('/auth/login')) { s.clear(); router.navigateByUrl('/login?expired=1'); }
    if (e.status === 402 && !req.url.includes('/billing')) { s.refreshMe().catch(() => {}); router.navigateByUrl('/settings/billing'); }
    return throwError(() => Object.assign(new Error(msg), { status: e.status, code: e.error && e.error.code }));
  }));
};

/* demo build: answer every API call from the in-browser MockServer (public/demo/mock.js) */
export const mockInterceptor: HttpInterceptorFn = (req) => {
  const s = inject(Session);
  const w = window as any;
  const path = req.urlWithParams.replace(/^.*\/api\/v1/, '');
  return new Observable(obs => {
    const [lo, hi] = w.API_CONFIG.latency; const timer = setTimeout(async () => {
      try {
        let body = req.body;
        if (body instanceof FormData) { const f = body.get('file') as File; body = { name: f.name, size: f.size, type: f.type, url: URL.createObjectURL(f) }; }
        let out = w.DemoExtra?.handle(req.method, path, body);
        if (out === undefined) out = await w.MockServer.handle(req.method, path, body, (type: string, data: any) => s.emit(type, data));
        obs.next(new HttpResponse({ status: 200, body: out })); obs.complete();
      } catch (e: any) { obs.error(Object.assign(new Error(e.message || 'Demo error'), { status: e.status || 400 })); }
    }, lo + Math.random() * (hi - lo));
    return () => clearTimeout(timer);
  });
};
