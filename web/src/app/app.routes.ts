import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Session } from './core/session.service';
import { environment } from '../environments/environment';
import { Shell } from './layout/shell';
import { LoginPage } from './pages/login';

/* signed in (initialises session on first navigation) */
const authed: CanActivateFn = async () => {
  const s = inject(Session); const router = inject(Router);
  if (!s.ready() && !(await s.init())) return router.parseUrl('/login');
  return true;
};
/* tenant CRM screens: not for the platform-only owner, not while billing is locked */
const crm: CanActivateFn = () => {
  const s = inject(Session); const router = inject(Router);
  if (s.platformOnly()) return router.parseUrl('/platform/institutions');
  if (s.billingLocked()) return router.parseUrl('/settings/billing');
  return true;
};
const adminOnly: CanActivateFn = () => {
  const s = inject(Session); const router = inject(Router);
  if (s.platformOnly()) return router.parseUrl('/platform/institutions');
  return environment.demo || s.role() === 'admin' ? true : router.parseUrl('/home');
};
const platform: CanActivateFn = () => inject(Session).platformOnly() ? true : inject(Router).parseUrl('/home');
const loginPage: CanActivateFn = async () => {
  const s = inject(Session); const router = inject(Router);
  if (environment.demo) return router.parseUrl('/home');
  if (s.token() && (s.ready() || (await s.init()))) return router.parseUrl(s.platformOnly() ? '/platform/institutions' : '/home');
  return true;
};

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [loginPage], title: 'Sign in · K3 Admissions' },
  {
    path: '', component: Shell, canActivate: [authed],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', canActivate: [crm], loadComponent: () => import('./pages/home').then(m => m.HomePage), title: 'Home · K3' },
      { path: 'leads', canActivate: [crm], loadComponent: () => import('./pages/leads').then(m => m.LeadsPage), title: 'Leads · K3' },
      { path: 'inbox', canActivate: [crm], loadComponent: () => import('./pages/inbox').then(m => m.InboxPage), title: 'Inbox · K3' },
      { path: 'followups', canActivate: [crm], loadComponent: () => import('./pages/followups').then(m => m.FollowupsPage), title: 'Follow-ups · K3' },
      { path: 'nurture', canActivate: [crm], loadComponent: () => import('./pages/nurture').then(m => m.NurturePage), title: 'Nurture · K3' },
      { path: 'broadcasts', canActivate: [crm], loadComponent: () => import('./pages/broadcasts').then(m => m.BroadcastsPage), title: 'Broadcasts · K3' },
      { path: 'broadcasts/new', canActivate: [crm], loadComponent: () => import('./pages/broadcast-new').then(m => m.BroadcastNewPage), title: 'New broadcast · K3' },
      { path: 'templates', canActivate: [crm], loadComponent: () => import('./pages/templates').then(m => m.TemplatesPage), title: 'Templates · K3' },
      { path: 'ai-qualifier', canActivate: [crm], loadComponent: () => import('./pages/ai').then(m => m.AiPage), title: 'AI Qualifier · K3' },
      { path: 'reports', canActivate: [crm], loadComponent: () => import('./pages/reports').then(m => m.ReportsPage), title: 'Reports · K3' },
      { path: 'api', canActivate: [crm], loadComponent: () => import('./pages/api-docs').then(m => m.ApiDocsPage), title: 'API · K3' },
      { path: 'settings', canActivate: [adminOnly], loadComponent: () => import('./pages/settings').then(m => m.SettingsPage), title: 'Settings · K3' },
      { path: 'settings/:tab', canActivate: [adminOnly], loadComponent: () => import('./pages/settings').then(m => m.SettingsPage), title: 'Settings · K3' },
      { path: 'platform', pathMatch: 'full', redirectTo: 'platform/institutions' },
      { path: 'platform/:tab', canActivate: [platform], loadComponent: () => import('./pages/platform').then(m => m.PlatformPage), title: 'Platform · K3' },
    ],
  },
  { path: '**', redirectTo: '' },
];
