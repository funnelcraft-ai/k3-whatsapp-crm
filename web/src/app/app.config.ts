import { ApplicationConfig, LOCALE_ID, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withNavigationErrorHandler } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { LocationStrategy } from '@angular/common';
import { routes } from './app.routes';
import { DemoHashLocation } from './core/demo-location';
import { authInterceptor, mockInterceptor } from './core/interceptors';
import { environment } from '../environments/environment';

/* after a redeploy an open tab may ask for chunks that no longer exist → reload once to pick up the new build */
const reloadOnStaleChunk = withNavigationErrorHandler(e => {
  const msg = String((e.error as any)?.message || e.error || '');
  if (/dynamically imported module|Importing a module script failed|Loading chunk/i.test(msg)) {
    try { const last = +(sessionStorage.getItem('k3-reloaded') || 0); if (Date.now() - last > 30000) { sessionStorage.setItem('k3-reloaded', String(Date.now())); location.assign(e.url); } } catch { /* storage blocked: leave the error visible */ }
  }
});
const routerFeatures: any[] = [withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'top' }), reloadOnStaleChunk];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, ...routerFeatures),
    ...(environment.demo ? [{ provide: LocationStrategy, useClass: DemoHashLocation }] : []),
    provideHttpClient(withInterceptors(environment.demo ? [mockInterceptor] : [authInterceptor])),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000, horizontalPosition: 'start' } },
    { provide: LOCALE_ID, useValue: 'en-IN' },
    provideAppInitializer(() => { inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-rounded'); }),
  ],
};
