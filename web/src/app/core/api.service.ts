/* Single gateway to the backend REST API (/api/v1). In the demo build an interceptor answers from the in-browser mock. */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class Api {
  private http = inject(HttpClient);
  readonly base = environment.apiBase;
  private params(o?: Record<string, any>) { let p = new HttpParams(); for (const [k, v] of Object.entries(o || {})) if (v !== '' && v != null && v !== 'all') p = p.set(k, String(v)); return p; }
  get<T = any>(path: string, q?: Record<string, any>) { return firstValueFrom(this.http.get<T>(this.base + path, { params: this.params(q) })); }
  post<T = any>(path: string, body?: any) { return firstValueFrom(this.http.post<T>(this.base + path, body ?? {})); }
  put<T = any>(path: string, body?: any) { return firstValueFrom(this.http.put<T>(this.base + path, body ?? {})); }
  patch<T = any>(path: string, body?: any) { return firstValueFrom(this.http.patch<T>(this.base + path, body ?? {})); }
  del<T = any>(path: string) { return firstValueFrom(this.http.delete<T>(this.base + path)); }

  // auth & lookups
  login = (email: string, password: string, otp?: string) => this.post('/auth/login', otp ? { email, password, otp } : { email, password });
  me = () => this.get('/auth/me');
  changePassword = (current: string, next: string) => this.post('/auth/password', { current, next });
  logoutAll = () => this.post('/auth/logout-all');
  twoFactor = () => this.get('/auth/2fa');
  twoFactorSetup = (password: string) => this.post('/auth/2fa/setup', { password });
  twoFactorEnable = (code: string) => this.post('/auth/2fa/enable', { code });
  twoFactorDisable = (password: string, code: string) => this.post('/auth/2fa/disable', { password, code });
  audit = (q?: any) => this.get<any[]>('/settings/audit', q);
  platformAudit = (q?: any) => this.get<any[]>('/platform/audit', q);
  meta = () => this.get('/meta');
  // leads
  leads = (f?: any) => this.get<any[]>('/leads', f);
  lead = (id: string) => this.get(`/leads/${id}`);
  createLead = (d: any) => this.post('/leads', d);
  updateLead = (id: string, p: any) => this.patch(`/leads/${id}`, p);
  addNote = (id: string, text: string) => this.post(`/leads/${id}/notes`, { text });
  importLeads = (rows: any[], sendWelcome = false) => this.post('/leads/import', { rows, sendWelcome });
  qualify = (id: string) => this.post(`/leads/${id}/qualify`);
  qualifyAll = () => this.post('/leads/qualify');
  // inbox
  conversations = () => this.get<any[]>('/conversations');
  messages = (id: string) => this.get<any[]>(`/leads/${id}/messages`);
  send = (id: string, msg: any) => this.post(`/leads/${id}/messages`, msg);
  // follow-ups
  followups = () => this.get<any[]>('/followups');
  createFollowup = (d: any) => this.post('/followups', d);
  updateFollowup = (id: string, p: any) => this.patch(`/followups/${id}`, p);
  // sequences
  sequences = () => this.get<any[]>('/sequences');
  createSequence = (d: any) => this.post('/sequences', d);
  updateSequence = (id: string, p: any) => this.patch(`/sequences/${id}`, p);
  deleteSequence = (id: string) => this.del(`/sequences/${id}`);
  enroll = (id: string, leadIds: string[]) => this.post(`/sequences/${id}/enroll`, { leadIds });
  // templates
  templates = () => this.get<any[]>('/templates');
  createTemplate = (d: any) => this.post('/templates', d);
  syncTemplates = () => this.post('/templates/sync');
  recommendedTemplates = () => this.post('/templates/recommended');
  updateTemplate = (id: string, d: any) => this.patch(`/templates/${id}`, d);
  templateVariables = () => this.get('/templates/variables');
  previewTemplate = (id: string, d: any) => this.post(`/templates/${id}/preview`, d);
  // media
  upload = (file: File) => { const fd = new FormData(); fd.append('file', file, file.name || 'file'); return this.post('/media', fd); };
  // broadcasts
  broadcasts = () => this.get<any[]>('/broadcasts');
  audience = (seg: any) => this.post('/broadcasts/audience', seg);
  createBroadcast = (d: any) => this.post('/broadcasts', d);
  sendBroadcast = (id: string) => this.post(`/broadcasts/${id}/send`);
  failed = (id: string) => this.get<any[]>(`/broadcasts/${id}/failed`);
  retryFailed = (id: string) => this.post(`/broadcasts/${id}/retry-failed`);
  // reports & AI
  report = (range: string) => this.get('/reports/overview', { range });
  classify = (text: string) => this.post('/ai/classify', { text });
  aiConfig = () => this.get('/ai/config');
  setAiConfig = (c: any) => this.put('/ai/config', c);
  // settings / team / billing
  settings = () => this.get('/settings');
  saveSettings = (d: any) => this.put('/settings', d);
  testWhatsApp = () => this.post('/settings/whatsapp/test');
  embeddedSignup = (d: any) => this.post('/settings/whatsapp/embedded', d);
  team = () => this.get<any[]>('/team');
  addUser = (d: any) => this.post('/team', d);
  updateUser = (id: string, d: any) => this.patch(`/team/${id}`, d);
  rotateWebhookKey = () => this.post('/settings/rotate-webhook-key');
  billing = () => this.get('/billing');
  invoiceHtml = (id: string) => firstValueFrom(this.http.get(this.base + `/billing/invoices/${id}`, { responseType: 'text' }));
  platformInvoiceHtml = (id: string) => firstValueFrom(this.http.get(this.base + `/platform/payments/${id}/invoice`, { responseType: 'text' }));
  backupBlob = (name: string) => firstValueFrom(this.http.get(this.base + `/platform/backups/${encodeURIComponent(name)}`, { responseType: 'blob' }));
  billingDetails = (d: any) => this.put('/billing/details', d);
  checkout = (planId: string) => this.post('/billing/checkout', { planId });
  verifyPayment = (d: any) => this.post('/billing/verify', d);
  cancelSubscription = (immediately = false) => this.post('/billing/cancel', { immediately });
  // platform
  tenants = () => this.get<any[]>('/platform/tenants');
  createTenant = (d: any) => this.post('/platform/tenants', d);
  updateTenant = (id: string, d: any) => this.patch(`/platform/tenants/${id}`, d);
  impersonate = (id: string, o?: { reason?: string; readOnly?: boolean }) => this.post(`/platform/tenants/${id}/impersonate`, o || {});
  createDemo = (d: any) => this.post('/platform/demo', d);
  platformAdmins = () => this.get<any[]>('/platform/admins');
  addPlatformAdmin = (d: any) => this.post('/platform/admins', d);
  plans = () => this.get<any[]>('/platform/plans');
  createPlan = (d: any) => this.post('/platform/plans', d);
  updatePlan = (id: string, d: any) => this.patch(`/platform/plans/${id}`, d);
  payments = () => this.get<any[]>('/platform/payments');
  company = () => this.get('/platform/company');
  saveCompany = (d: any) => this.put('/platform/company', d);
  backups = () => this.get('/platform/backups');
  runBackup = () => this.post('/platform/backups');
}
