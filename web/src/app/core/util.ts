/* Shared constants & helpers */
export const STAGES = ['new', 'contacted', 'counselling', 'visit', 'application', 'admitted', 'lost'];
export const STAGE_LABEL: Record<string, string> = { new: 'New enquiry', contacted: 'Contacted', counselling: 'Counselling', visit: 'Campus visit', application: 'Application', admitted: 'Admitted', lost: 'Lost' };
export const STAGE_COLOR: Record<string, string> = { new: '#80868b', contacted: '#1a73e8', counselling: '#9334e6', visit: '#e37400', application: '#12a4af', admitted: '#188038', lost: '#d93025' };
export const TEMP: Record<string, { label: string; icon: string; cls: string; color: string }> = {
  hot: { label: 'Hot', icon: 'local_fire_department', cls: 't-hot', color: '#d93025' },
  warm: { label: 'Warm', icon: 'wb_sunny', cls: 't-warm', color: '#e37400' },
  cold: { label: 'Cold', icon: 'ac_unit', cls: 't-cold', color: '#1a73e8' },
};
export const FU_TYPE: Record<string, { icon: string; label: string; bg: string; fg: string }> = {
  call: { icon: 'call', label: 'Call', bg: '#e3eeff', fg: '#1967d2' }, whatsapp: { icon: 'chat', label: 'WhatsApp', bg: '#e6f4ea', fg: '#137333' },
  visit: { icon: 'apartment', label: 'Campus visit', bg: '#fff0d6', fg: '#a05a00' }, email: { icon: 'mail', label: 'Email', bg: '#f3e8fd', fg: '#8430ce' },
};
export const AV_COLORS = ['#1a73e8', '#188038', '#e37400', '#9334e6', '#d93025', '#12a4af', '#c2185b', '#5f6368', '#f29900', '#1967d2'];
export const VAR_DEFAULTS = ['parent_first', 'program', 'deadline', 'apply_link', 'institution'];

export const initials = (n: string) => String(n || '?').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
export const hashColor = (s: string) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
export const pct = (x: number) => Math.round((x || 0) * 100) + '%';
export const num = (n: number) => (n || 0).toLocaleString('en-IN');
export const inr = (n: number) => '₹' + Math.round(n || 0).toLocaleString('en-IN');
export const rupees = (paise: number) => '₹' + ((paise || 0) / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 });
export const isToday = (at: string | Date) => new Date(at).toDateString() === new Date().toDateString();
export const timeOf = (at: string | Date) => new Date(at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
export const fmtDate = (at: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) => (at ? new Date(at).toLocaleString('en-IN', opts) : '—');
export function rel(at?: string | null) {
  if (!at) return '—';
  const m = Math.round((Date.now() - new Date(at).getTime()) / 6e4);
  if (m < 1) return 'just now'; if (m < 60) return m + 'm ago'; const h = Math.round(m / 60); if (h < 24) return h + 'h ago';
  const d = Math.round(h / 24); if (d === 1) return 'Yesterday'; if (d < 7) return d + 'd ago';
  return new Date(at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
export function dueLabel(at?: string | null) {
  if (!at) return { text: '—', over: false };
  const t = new Date(at), now = new Date(); const sod = new Date(now); sod.setHours(0, 0, 0, 0);
  const dd = Math.floor((t.getTime() - sod.getTime()) / 864e5);
  if (t < now) { const d = Math.round((now.getTime() - t.getTime()) / 864e5); return { text: d >= 1 ? `Overdue · ${d}d` : `Overdue · ${timeOf(at)}`, over: true }; }
  if (dd === 0) return { text: 'Today · ' + timeOf(at), over: false };
  if (dd === 1) return { text: 'Tomorrow · ' + timeOf(at), over: false };
  return { text: t.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), over: false };
}
export const debounce = <T extends (...a: any[]) => any>(fn: T, ms = 250) => { let t: any; return (...a: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const varCount = (body: string) => Math.max(0, ...(String(body || '').match(/\{\{(\d+)\}\}/g) || []).map(x => +x.replace(/\D/g, '')));

/* client-side template preview (mirrors server mapping) */
export function fillTemplate(t: any, lead: any, meta: any) {
  const map: string[] = t.varMap || []; const tv = meta?.templateVars || { deadline: '30 Nov', applyLink: '' };
  const first = (s: string) => String(s || '').trim().split(/\s+/)[0];
  const val = (src: string): any => {
    if (!src) return null; if (src.startsWith('custom:')) return src.slice(7);
    if (src.startsWith('field:')) { const k = src.slice(6); return lead?.custom?.[k] ?? `[${k}]`; }
    const c = lead && meta?.counsellors ? meta.counsellors.find((x: any) => x.id === lead.counsellorId) : null;
    return ({ parent_first: first(lead?.parent) || 'Parent', parent_full: lead?.parent || 'Parent', student_first: first(lead?.student || lead?.parent) || 'Student', student_full: lead?.student || lead?.parent || 'Student',
      program: lead?.program || 'Class 1', phone: lead?.phone || '', area: lead?.area || '', counsellor: c?.name || 'our admissions team', institution: meta?.institution?.name,
      session: meta?.institution?.session, deadline: tv.deadline, apply_link: tv.applyLink || meta?.institution?.name } as any)[src];
  };
  return String(t.body || '').replace(/\{\{(\d+)\}\}/g, (_m: string, i: string) => { const v = val(map[+i - 1] || VAR_DEFAULTS[+i - 1] || 'institution'); return v == null || v === '' ? '-' : v; });
}

/* strong one-time password for a new account (CSPRNG; 10 random letters + a fixed digit suffix so it always meets the password policy) */
export function tempPassword(): string {
  const A = 'abcdefghjkmnpqrstuvwxyz'; const b = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(b, x => A[x % A.length]).join('') + '-K7x';
}
