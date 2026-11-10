/* Demo institution with realistic sample data — used by the CLI script and the
   "Create demo school" button in the platform admin (works on hosts without shell access). */
const crypto = require('crypto');
const { q, one, normalizePhone, displayPhone, COLORS, HttpError, config } = require('../core');
const { hash } = require('../auth');
const CRM = require('./crm');
const { TEMPLATES } = require('./defaults');

let seed = 20261102; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)]; const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const STUDENTS = ['Aarav', 'Ishaan', 'Ananya', 'Riya', 'Arjun', 'Diya', 'Vihaan', 'Saanvi', 'Kabir', 'Myra', 'Reyansh', 'Aadhya', 'Rohan', 'Sneha', 'Aditya', 'Tanisha', 'Rudra', 'Anika', 'Ayaan', 'Pihu', 'Kiara', 'Dev', 'Trisha', 'Ritam', 'Srijita', 'Sayan', 'Arnav', 'Meghna'];
const PARENTS = ['Sourav', 'Anirban', 'Rakesh', 'Priya', 'Moumita', 'Sudipta', 'Amit', 'Neha', 'Rajesh', 'Sanjay', 'Pooja', 'Debasish', 'Kaushik', 'Rina', 'Tanmay', 'Sumana'];
const SURN = ['Banerjee', 'Chatterjee', 'Mukherjee', 'Sen', 'Das', 'Ghosh', 'Bose', 'Roy', 'Sharma', 'Agarwal', 'Gupta', 'Dutta', 'Saha', 'Paul', 'Jain'];
const AREAS = ['Salt Lake', 'New Town', 'Behala', 'Ballygunge', 'Dum Dum', 'Howrah', 'Garia', 'Tollygunge'];
const SOURCES = [['Meta Ads', 30], ['Google Ads', 22], ['Website Form', 16], ['Walk-in', 9], ['Referral', 10], ['JustDial', 7], ['Event / Seminar', 6]];
const PROGRAMS = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 3', 'Class 5', 'Class 6', 'Class 8', 'Class 9', 'Class 11 – Science', 'Class 11 – Commerce'];
const LINES = { hot: ['What is the fee structure for this class?', 'Can we visit the campus this Saturday?', 'Are seats still available? We want to apply soon.', 'What documents are needed for the admission form?'], warm: ['Please share the brochure.', 'Do you have school bus from our area?', 'Which board do you follow?'], cold: ['Just checking options for now.', 'Will let you know.', 'Fees seem too high for us.'] };
const weighted = () => { let r = rnd() * 100; for (const [s, w] of SOURCES) { if ((r -= w) < 0) return s; } return 'Meta Ads'; };

async function seedDemo(emailIn, password) {
  const { createTenant } = require('../routes/admin');
  const email = String(emailIn || 'demo@k3solutions.in').toLowerCase();
  password = password || (config.isProduction ? 'Dm-' + crypto.randomBytes(8).toString('hex') + '-9x' : 'Demo@12345');   // the well-known demo password is for local development only
  seed = 20261102;
  if (await one(`SELECT 1 FROM users WHERE lower(email)=$1`, [email])) throw new HttpError(409, 'A user with this email already exists: ' + email);
  const t = await createTenant({ name: 'Greenfield Academy (Demo)', type: 'K-12 School (CBSE)', city: 'Kolkata', session: '2027–28', plan: 'Demo', maxUsers: 10, maxContacts: 10000, programs: PROGRAMS, admin: { name: 'Admissions Office', email, password } }, { devSeed: true });
  await q(`UPDATE tenants SET settings = settings || $2 WHERE id=$1`, [t.id, { spend: { 'Meta Ads': 86500, 'Google Ads': 64200, 'JustDial': 12000, 'Event / Seminar': 25000 }, welcomeTemplate: '' }]);
  const counsellors = [];
  for (const [i, n] of ['Rupa Sen', 'Arijit Das', 'Neha Kapoor'].entries()) {
    counsellors.push((await one(`INSERT INTO users(tenant_id, name, email, password_hash, role, color) VALUES ($1,$2,$3,$4,'counsellor',$5) RETURNING id`, [t.id, n, n.split(' ')[0].toLowerCase() + '.' + email, await hash(password), COLORS[i + 1]])).id);
  }
  for (const tpl of TEMPLATES) await q(`INSERT INTO templates(tenant_id, name, language, category, status, header, body, buttons) VALUES ($1,$2,$3,$4,'Approved',$5,$6,$7) ON CONFLICT DO NOTHING`, [t.id, tpl.name, tpl.language, tpl.category, tpl.header, tpl.body, JSON.stringify(tpl.buttons)]);
  const now = Date.now();
  for (let i = 0; i < 140; i++) {
    const age = Math.pow(rnd(), 1.25) * 80; const created = new Date(now - age * 864e5);
    const s = pick(SURN); const r = rnd();
    let stage = age < 2 ? 'new' : r < 0.15 ? 'new' : r < 0.37 ? 'contacted' : r < 0.55 ? 'counselling' : r < 0.69 ? 'visit' : r < 0.79 ? 'application' : r < 0.9 ? 'admitted' : 'lost';
    const persona = stage === 'lost' ? 'cold' : ['visit', 'application', 'admitted'].includes(stage) ? 'hot' : pick(['hot', 'warm', 'warm', 'cold']);
    const wa = normalizePhone('9' + String(ri(100000000, 999999999)));
    const parent = pick(PARENTS) + ' ' + s; const program = pick(PROGRAMS); const avg = persona === 'hot' ? ri(2, 40) : persona === 'warm' ? ri(20, 300) : ri(200, 1500);
    const lead = await one(`INSERT INTO leads(tenant_id, student, parent, phone, wa_id, program, source, campaign, area, stage, counsellor_id, created_at, last_activity_at, avg_reply_mins, next_follow_up)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13,$14) ON CONFLICT DO NOTHING RETURNING *`,
      [t.id, pick(STUDENTS) + ' ' + s, parent, displayPhone(wa), wa, program, weighted(), 'Admissions 2027', pick(AREAS), stage, pick(counsellors), created, avg,
        ['admitted', 'lost'].includes(stage) ? null : new Date(now + (rnd() < 0.15 ? -ri(1, 3) : ri(0, 7)) * 864e5)]);
    if (!lead) continue;
    let at = created.getTime() + 40e3; let last = at, lastIn = null, lastOut = at, replies = 0;
    await q(`INSERT INTO messages(tenant_id, lead_id, sender, type, text, template, status, created_at) VALUES ($1,$2,'bot','template',$3,'welcome_enquiry','read',$4)`, [t.id, lead.id, `Hi ${parent.split(' ')[0]}, thank you for your enquiry about ${program} admissions at Greenfield Academy. A counsellor will contact you shortly.`, new Date(at)]);
    const n = persona === 'hot' ? ri(2, 4) : persona === 'warm' ? ri(1, 2) : ri(0, 1);
    for (let k = 0; k < n; k++) {
      at += avg * 6e4 + ri(1, 30) * 6e4; if (at > now) break;
      await q(`INSERT INTO messages(tenant_id, lead_id, sender, type, text, status, created_at) VALUES ($1,$2,'lead','text',$3,'received',$4)`, [t.id, lead.id, pick(LINES[persona]), new Date(at)]); lastIn = at; replies++;
      at += ri(2, 50) * 6e4; if (at > now) break;
      await q(`INSERT INTO messages(tenant_id, lead_id, sender, type, text, status, created_at) VALUES ($1,$2,'agent','text',$3,'read',$4)`, [t.id, lead.id, pick(['Happy to help! Sharing the details now.', 'Our next Open House is on Saturday, 10 AM. Shall I reserve a seat?', 'Sharing our virtual campus tour — let me know your questions.']), new Date(at)]); lastOut = at;
      last = at;
    }
    await q(`UPDATE leads SET last_activity_at=$2, last_inbound_at=$3, last_outbound_at=$4, reply_count=$5 WHERE id=$1`, [lead.id, new Date(Math.min(now, Math.max(last, lastIn || 0))), lastIn ? new Date(lastIn) : null, new Date(lastOut), replies]);
    await q(`INSERT INTO timeline(tenant_id, lead_id, icon, text, created_at) VALUES ($1,$2,'person_add',$3,$4)`, [t.id, lead.id, `Enquiry captured from ${lead.source}`, created]);
    if (lead.next_follow_up) await q(`INSERT INTO followups(tenant_id, lead_id, type, due_at, note, owner_id, auto) VALUES ($1,$2,$3,$4,$5,$6,true)`, [t.id, lead.id, pick(['call', 'whatsapp', 'visit']), lead.next_follow_up, 'Follow up on ' + program + ' enquiry', lead.counsellor_id]);
    await CRM.requalify(t, lead.id, { silent: true });
  }
  return { tenant: t, email, password, counsellors: ['rupa', 'arijit', 'neha'].map(n => `${n}.${email}`) };
}
module.exports = { seedDemo };
