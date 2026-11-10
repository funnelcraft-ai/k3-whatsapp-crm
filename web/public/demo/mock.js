/* Demo-only: in-browser mock server + rules engine (excluded from the production build) */
/* =====================================================================
   AI QUALIFICATION ENGINE (demo)
   Transparent, rules + keyword based scoring so counsellors can see
   *why* a lead is Hot / Warm / Cold. In production replace the body of
   POST /leads/:id/qualify with your LLM call — keep the same response.
   ===================================================================== */
const AIEngine = (() => {
  const HOT_WORDS = ['fee', 'fees', 'visit', 'seat', 'seats', 'apply', 'application', 'admission form', 'documents', 'book', 'payment', 'pay', 'scholarship', 'when can', 'interested', 'enrol', 'enroll', 'confirm', 'saturday', 'tomorrow', 'form'];
  const NEG_WORDS = ['not now', 'next year', 'too high', 'expensive', 'later', 'not interested', 'stop', 'no thanks', 'already admitted', 'other school', 'just checking', 'will let you know'];
  const SOURCE_Q = { 'Walk-in': 15, 'Referral': 14, 'Event / Seminar': 12, 'Website Form': 11, 'Google Ads': 10, 'Meta Ads': 7, 'JustDial': 6 };
  const STAGE_Q = { new: 0, contacted: 4, counselling: 8, visit: 12, application: 15, admitted: 15, lost: 0 };

  const DEFAULT_CONFIG = {
    weights: { intent: 1, engagement: 1, responsiveness: 1, source: 1, stage: 1, recency: 1 },
    thresholds: { hot: 70, warm: 40 },
    autoQualifyOnReply: true,
    autoAssignHot: true,
  };

  function score(lead, cfg, now = Date.now()) {
    const w = cfg.weights;
    const inbound = (lead.messages || []).filter(m => m.from === 'lead');
    const text = inbound.map(m => m.text.toLowerCase()).join(' \n ');
    const hotHits = HOT_WORDS.filter(k => text.includes(k));
    const negHits = NEG_WORDS.filter(k => text.includes(k));

    const f = {};
    f.intent = Math.max(0, Math.min(25, hotHits.length * 7 - negHits.length * 9));
    f.engagement = Math.min(20, [0, 9, 15, 20][Math.min(3, inbound.length)]);
    const mins = lead.avgReplyMins;
    f.responsiveness = inbound.length === 0 ? 0 : mins < 15 ? 15 : mins < 60 ? 11 : mins < 240 ? 6 : 2;
    f.source = SOURCE_Q[lead.source] ?? 8;
    f.stage = STAGE_Q[lead.stage] ?? 0;
    const days = (now - new Date(lead.lastActivityAt).getTime()) / 864e5;
    f.recency = days <= 2 ? 10 : days <= 7 ? 6 : days <= 14 ? 3 : 0;

    const max = { intent: 25, engagement: 20, responsiveness: 15, source: 15, stage: 15, recency: 10 };
    let num = 0, den = 0;
    for (const k in max) { num += f[k] * w[k]; den += max[k] * w[k]; }
    let s = den ? Math.round((num / den) * 100) : 0;
    if (lead.stage === 'lost') s = Math.min(s, 15);
    if (lead.stage === 'admitted') s = Math.max(s, 90);

    const temp = s >= cfg.thresholds.hot ? 'hot' : s >= cfg.thresholds.warm ? 'warm' : 'cold';

    const reasons = [];
    if (hotHits.length) reasons.push({ good: true, text: `Asked about ${hotHits.slice(0, 3).map(h => `“${h}”`).join(', ')}` });
    if (negHits.length) reasons.push({ good: false, text: `Hesitation signals: ${negHits.slice(0, 2).map(h => `“${h}”`).join(', ')}` });
    if (inbound.length >= 2) reasons.push({ good: true, text: `${inbound.length} replies on WhatsApp — actively engaged` });
    if (inbound.length === 0) reasons.push({ good: false, text: 'No reply to WhatsApp messages yet' });
    if (inbound.length && mins < 15) reasons.push({ good: true, text: `Replies fast (avg ${mins} min)` });
    if (inbound.length && mins >= 240) reasons.push({ good: false, text: `Slow replies (avg ${Math.round(mins / 60)} h)` });
    if (f.source >= 12) reasons.push({ good: true, text: `High-intent source: ${lead.source}` });
    if (f.stage >= 12) reasons.push({ good: true, text: `Progressed to ${STAGE_LABEL[lead.stage]}` });
    if (f.recency === 0) reasons.push({ good: false, text: `No activity for ${Math.round(days)} days` });

    const nextAction = lead.stage === 'admitted' ? 'Send welcome kit & onboarding checklist'
      : lead.stage === 'lost' ? 'Add to next-session re-engagement list'
      : temp === 'hot' ? (lead.stage === 'visit' || lead.stage === 'application' ? 'Call today and close the application / fee payment' : 'Call within 1 hour and book a campus visit')
      : temp === 'warm' ? 'Share fee structure + virtual tour; enroll in Warm Nurture'
      : 'Move to monthly re-engagement drip (Open House invites)';

    return { score: s, temp, factors: f, max, reasons: reasons.slice(0, 5), nextAction, updatedAt: new Date(now).toISOString(), model: 'k3-qualifier-demo-v1' };
  }

  function classify(text) {
    const t = (text || '').toLowerCase();
    const has = arr => arr.some(k => t.includes(k));
    let intent = 'General enquiry', reply = 'Thank you for reaching out! A counsellor will get back to you shortly. 🙏';
    if (has(['fee', 'fees', 'cost', 'payment', 'scholarship'])) { intent = 'Fee enquiry'; reply = 'Sharing the fee structure PDF for {{program}}. Early-bird admissions get a 10% waiver on the admission fee till 30 Nov.'; }
    if (has(['visit', 'campus', 'tour', 'saturday', 'come and see'])) { intent = 'Campus visit request'; reply = 'We’d love to host you! Campus tours run Mon–Sat, 10 AM–1 PM. Shall I book Saturday 11 AM for you?'; }
    if (has(['seat', 'apply', 'form', 'documents', 'admission'])) { intent = 'Ready to apply'; reply = 'Seats for {{program}} are filling fast. Here is the online application link — documents needed: birth certificate, last report card, 2 photos, Aadhaar.'; }
    if (has(['bus', 'transport', 'van'])) { intent = 'Transport enquiry'; reply = 'Yes, our school buses cover your area. Pick-up timings and route details attached.'; }
    if (has(['not now', 'next year', 'not interested', 'stop', 'no thanks', 'later'])) { intent = 'Not interested / later'; reply = 'No problem at all! We’ll keep you posted about our Open House. Reply STOP anytime to opt out.'; }
    const pos = has(['great', 'thanks', 'thank you', 'good', 'interested', 'yes', 'sure', 'ok']);
    const neg = has(['expensive', 'too high', 'bad', 'not', 'no ', 'worst', 'disappoint']);
    const sentiment = pos && !neg ? 'Positive' : neg && !pos ? 'Negative' : 'Neutral';
    const hotness = ['Ready to apply', 'Campus visit request', 'Fee enquiry'].includes(intent) ? 'hot' : intent === 'Not interested / later' ? 'cold' : 'warm';
    return { intent, sentiment, signal: hotness, suggestedReply: reply, confidence: +(0.72 + Math.random() * 0.25).toFixed(2) };
  }

  return { score, classify, DEFAULT_CONFIG };
})();

/* =====================================================================
   MOCK SERVER — seeded, education-sector demo data
   ===================================================================== */
const MockServer = (() => {
  const DEMO_TRIGGERS = [['lead_created','New lead created (any source)'],['temp:hot','AI marks lead as 🔥 Hot'],['temp:warm','AI marks lead as Warm'],['temp:cold','AI marks lead as Cold'],['stage:visit','Stage changes to Campus visit'],['stage:application','Stage changes to Application'],['source:Meta Ads','Lead source is Meta Ads'],['manual','Manual enrolment only']].map(([id,label]) => ({ id, label }));
  const STORE_KEY = 'k3crm-demo-db-v2';
  let seed = 20261102;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const ri = (a, b) => Math.floor(a + rnd() * (b - a + 1));
  const uid = p => p + Math.random().toString(36).slice(2, 8).toUpperCase();
  const DAY = 864e5;

  const PROGRAMS = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 3', 'Class 5', 'Class 6', 'Class 8', 'Class 9', 'Class 11 – Science', 'Class 11 – Commerce', 'Class 11 – Humanities'];
  const SOURCES = ['Meta Ads', 'Google Ads', 'Website Form', 'Walk-in', 'Referral', 'JustDial', 'Event / Seminar'];
  const SOURCE_W = [30, 22, 16, 9, 10, 7, 6];
  const COUNSELLORS = [
    { id: 'c1', name: 'Rupa Sen', initials: 'RS', color: '#1a73e8' },
    { id: 'c2', name: 'Arijit Das', initials: 'AD', color: '#188038' },
    { id: 'c3', name: 'Neha Kapoor', initials: 'NK', color: '#e37400' },
    { id: 'c4', name: 'Sohini Ghosh', initials: 'SG', color: '#9334e6' },
  ];
  const AREAS = ['Salt Lake', 'New Town', 'Behala', 'Ballygunge', 'Dum Dum', 'Howrah', 'Garia', 'Tollygunge', 'Lake Town', 'Rajarhat'];
  const STUDENTS = ['Aarav', 'Ishaan', 'Ananya', 'Riya', 'Arjun', 'Diya', 'Vihaan', 'Saanvi', 'Kabir', 'Myra', 'Reyansh', 'Aadhya', 'Rohan', 'Sneha', 'Aditya', 'Tanisha', 'Rudra', 'Anika', 'Ayaan', 'Pihu', 'Shaurya', 'Kiara', 'Dev', 'Trisha', 'Ritam', 'Srijita', 'Sayan', 'Debolina', 'Arnav', 'Meghna', 'Ishita', 'Aryan'];
  const PARENTS = ['Sourav', 'Anirban', 'Rakesh', 'Priya', 'Moumita', 'Sudipta', 'Amit', 'Neha', 'Rajesh', 'Sanjay', 'Pooja', 'Debasish', 'Kaushik', 'Rina', 'Tanmay', 'Sumana', 'Vikram', 'Payel'];
  const SURNAMES = ['Banerjee', 'Chatterjee', 'Mukherjee', 'Sen', 'Das', 'Ghosh', 'Bose', 'Roy', 'Sharma', 'Agarwal', 'Gupta', 'Singh', 'Dutta', 'Saha', 'Paul', 'Kundu', 'Jain', 'Mehta'];
  const CAMPAIGNS = { 'Meta Ads': ['Admissions 2027 – Lead Form', 'Open House Nov – Reels', 'Pre-Primary Carousel'], 'Google Ads': ['Search – best CBSE school Kolkata', 'Search – Class 11 Science admission'], 'Website Form': ['Enquire Now – Homepage'], 'Walk-in': ['Front desk'], 'Referral': ['Parent referral programme'], 'JustDial': ['JustDial listing'], 'Event / Seminar': ['Education Fair – Science City'] };

  const LEAD_LINES = {
    hot: ['What is the fee structure for {{program}}?', 'Can we visit the campus this Saturday?', 'Are seats still available? We want to apply soon.', 'What documents are needed for the admission form?', 'Is there any scholarship for siblings?', 'Please confirm the visit slot for tomorrow 11am.'],
    warm: ['Please share the brochure.', 'Do you have school bus from {{area}}?', 'What is the student–teacher ratio?', 'Which board do you follow? CBSE?', 'What are the school timings?'],
    cold: ['Just checking options for now.', 'Will let you know.', 'Fees seem too high for us.', 'Not now, maybe next year.'],
  };
  const AGENT_LINES = ['Hi {{parent}}, this is {{counsellor}} from Greenfield Academy admissions. Happy to help with {{program}}!', 'Sharing our virtual campus tour 🎥 — have a look and let me know your questions.', 'Our next Open House is on Saturday, 10 AM. Shall I reserve a seat for your family?', 'Sharing the fee structure PDF. Early-bird waiver of 10% is valid till 30 Nov.'];
  const WELCOME = 'Hi {{parent}} 👋 Thank you for your enquiry about {{program}} admissions at Greenfield Academy! 🎓\nReply 1 for fee structure, 2 to book a campus visit, 3 to talk to a counsellor.';

  const fill = (s, l) => s.replace(/\{\{parent\}\}/g, l.parent.split(' ')[0]).replace(/\{\{program\}\}/g, l.program).replace(/\{\{area\}\}/g, l.area).replace(/\{\{counsellor\}\}/g, (COUNSELLORS.find(c => c.id === l.counsellorId) || {}).name || 'Admissions');
  const weighted = (arr, w) => { const t = w.reduce((a, b) => a + b, 0); let r = rnd() * t; for (let i = 0; i < arr.length; i++) { if ((r -= w[i]) < 0) return arr[i]; } return arr[0]; };

  function creativeSVG(title, sub, c1, c2, emoji) {
    const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    title = x(title); sub = x(sub);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><circle cx="680" cy="90" r="160" fill="#fff" opacity=".08"/><circle cx="90" cy="420" r="120" fill="#fff" opacity=".07"/><text x="60" y="120" font-family="Arial, sans-serif" font-size="80">${emoji}</text><text x="60" y="230" font-family="Arial, sans-serif" font-weight="700" font-size="54" fill="#fff">${title}</text><text x="60" y="290" font-family="Arial, sans-serif" font-size="28" fill="#fff" opacity=".9">${sub}</text><rect x="60" y="335" rx="28" width="250" height="56" fill="#fff"/><text x="185" y="372" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="22" fill="${c1}">Book a visit →</text><text x="740" y="420" text-anchor="end" font-family="Arial, sans-serif" font-size="20" fill="#fff" opacity=".85">Greenfield Academy</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function build() {
    seed = 20261102;
    const now = Date.now();
    const leads = [];
    for (let i = 0; i < 168; i++) {
      const age = Math.pow(rnd(), 1.25) * 88; // days ago, skewed recent
      const createdAt = now - age * DAY - ri(0, 10) * 36e5;
      const surname = pick(SURNAMES);
      const source = weighted(SOURCES, SOURCE_W);
      const program = pick(PROGRAMS);
      const r = rnd();
      // stage roughly correlated with age
      let stage = age < 2 ? (r < 0.6 ? 'new' : 'contacted')
        : r < 0.14 ? 'new' : r < 0.36 ? 'contacted' : r < 0.55 ? 'counselling' : r < 0.69 ? 'visit' : r < 0.79 ? 'application' : r < 0.9 ? 'admitted' : 'lost';
      if (age < 6 && (stage === 'admitted')) stage = 'application';
      const persona = stage === 'lost' ? 'cold' : ['visit', 'application', 'admitted'].includes(stage) ? (rnd() < 0.8 ? 'hot' : 'warm') : weighted(['hot', 'warm', 'cold'], [3, 4, 3]);
      const lead = {
        id: 'L' + (1001 + i),
        student: pick(STUDENTS) + ' ' + surname,
        parent: pick(PARENTS) + ' ' + surname,
        phone: '+91 ' + ri(70, 99) + ri(100, 999) + ' ' + ri(10000, 99999),
        email: '',
        program, source,
        campaign: pick(CAMPAIGNS[source]),
        area: pick(AREAS),
        stage,
        counsellorId: pick(COUNSELLORS).id,
        createdAt: new Date(createdAt).toISOString(),
        lastActivityAt: '',
        nextFollowUp: null,
        avgReplyMins: persona === 'hot' ? ri(2, 40) : persona === 'warm' ? ri(20, 300) : ri(200, 1800),
        tags: [],
        notes: [],
        messages: [],
        unread: 0,
        sequences: [],
        timeline: [],
        optedOut: false,
      };
      lead.email = lead.parent.split(' ')[0].toLowerCase() + '.' + surname.toLowerCase() + ri(1, 99) + '@gmail.com';
      // conversation
      let t = createdAt + 40e3;
      lead.messages.push({ id: uid('M'), from: 'bot', text: fill(WELCOME, lead), at: new Date(t).toISOString(), status: 'read', type: 'template', template: 'welcome_enquiry' });
      const replies = persona === 'hot' ? ri(2, 4) : persona === 'warm' ? ri(1, 2) : ri(0, 1);
      for (let k = 0; k < replies; k++) {
        t += lead.avgReplyMins * 6e4 + ri(1, 30) * 6e4;
        if (t > now) break;
        lead.messages.push({ id: uid('M'), from: 'lead', text: fill(pick(LEAD_LINES[persona]), lead), at: new Date(t).toISOString() });
        t += ri(2, 50) * 6e4;
        if (t > now) break;
        lead.messages.push({ id: uid('M'), from: 'agent', text: fill(pick(AGENT_LINES), lead), at: new Date(t).toISOString(), status: pick(['read', 'read', 'delivered']) });
      }
      // a few last-message-from-lead (unread)
      if (age < 4 && rnd() < 0.45 && persona !== 'cold') {
        t = Math.min(now - ri(5, 300) * 6e4, t + ri(10, 200) * 6e4);
        lead.messages.push({ id: uid('M'), from: 'lead', text: fill(pick(LEAD_LINES[persona]), lead), at: new Date(t).toISOString() });
        lead.unread = 1;
      }
      lead.messages.sort((a, b) => a.at.localeCompare(b.at));
      if (lead.stage === 'new' && lead.messages.some(m => m.from === 'lead') && rnd() < 0.55) lead.stage = 'contacted';
      lead.lastActivityAt = lead.messages[lead.messages.length - 1].at;
      if (rnd() < 0.3) lead.lastActivityAt = new Date(Math.min(now - ri(1, 20) * 36e5, new Date(lead.lastActivityAt).getTime() + ri(1, 5) * DAY)).toISOString();
      if (!['admitted', 'lost'].includes(stage)) {
        const off = rnd() < 0.12 ? -ri(1, 3) : ri(0, 7);
        const d = new Date(now + off * DAY); d.setHours(ri(10, 18), pick([0, 15, 30, 45]), 0, 0);
        lead.nextFollowUp = d.toISOString();
      }
      lead.timeline.push({ at: lead.createdAt, icon: 'person_add', text: `Enquiry captured from ${source} (${lead.campaign})` });
      lead.timeline.push({ at: lead.messages[0].at, icon: 'smart_toy', text: 'Auto-reply sent: welcome_enquiry template' });
      if (stage !== 'new') lead.timeline.push({ at: new Date(createdAt + 0.5 * DAY).toISOString(), icon: 'call', text: 'First call by counsellor' });
      if (['visit', 'application', 'admitted'].includes(stage)) lead.timeline.push({ at: new Date(createdAt + 3 * DAY).toISOString(), icon: 'apartment', text: 'Campus visit completed' });
      if (['application', 'admitted'].includes(stage)) lead.timeline.push({ at: new Date(createdAt + 5 * DAY).toISOString(), icon: 'description', text: 'Application form submitted' });
      if (stage === 'admitted') lead.timeline.push({ at: new Date(createdAt + 7 * DAY).toISOString(), icon: 'school', text: 'Admission fee paid — Admitted 🎉' });
      if (stage === 'lost') lead.timeline.push({ at: lead.lastActivityAt, icon: 'block', text: 'Marked lost: ' + pick(['Chose another school', 'Fees beyond budget', 'Relocated', 'No response']) });
      lead.timeline = lead.timeline.filter(e => new Date(e.at).getTime() <= now);
      if (rnd() < 0.2) lead.tags.push(pick(['Sibling', 'Transport needed', 'Scholarship', 'Hostel', 'Staff ward']));
      lead.sequences = stage === 'new' || stage === 'contacted' ? ['s1'] : [];
      leads.push(lead);
    }

    const ai = JSON.parse(JSON.stringify(AIEngine.DEFAULT_CONFIG));
    leads.forEach(l => { l.ai = AIEngine.score(l, ai, now); });
    leads.forEach(l => { if (l.ai.temp === 'hot' && !['admitted', 'lost'].includes(l.stage)) l.sequences.push('s2'); else if (l.ai.temp === 'warm' && !['admitted', 'lost'].includes(l.stage)) l.sequences.push('s4'); else if (l.ai.temp === 'cold' && l.stage !== 'admitted') l.sequences.push('s5'); });

    const followups = [];
    leads.filter(l => l.nextFollowUp).forEach(l => {
      const type = l.ai.temp === 'hot' ? pick(['call', 'call', 'visit']) : pick(['whatsapp', 'call', 'whatsapp']);
      const note = { call: 'Call parent — discuss ' + l.program + (l.ai.temp === 'hot' ? ' & fees' : ''), visit: 'Confirm campus visit slot', whatsapp: 'Share brochure / virtual tour on WhatsApp' }[type];
      followups.push({ id: uid('F'), leadId: l.id, type, due: l.nextFollowUp, note, done: false, owner: l.counsellorId, auto: rnd() < 0.5 });
    });
    for (let i = 0; i < 14; i++) { const l = pick(leads); followups.push({ id: uid('F'), leadId: l.id, type: pick(['call', 'whatsapp']), due: new Date(now - ri(1, 6) * DAY).toISOString(), note: 'Follow-up after brochure share', done: true, owner: l.counsellorId, auto: false }); }

    const templates = [
      { id: 't1', name: 'welcome_enquiry', category: 'Marketing', language: 'English', status: 'Approved', header: 'none', body: 'Hi {{1}} 👋 Thank you for your enquiry about {{2}} admissions at Greenfield Academy! 🎓\nReply 1 for fee structure, 2 to book a campus visit, 3 to talk to a counsellor.', buttons: ['Fee structure', 'Book visit', 'Talk to counsellor'], sent: 1842, readRate: 0.87 },
      { id: 't2', name: 'campus_visit_invite', category: 'Marketing', language: 'English', status: 'Approved', header: 'image', body: 'Dear {{1}}, see our smart classrooms, labs and sports complex in person! Campus tours run Mon–Sat, 10 AM–1 PM. Tap below to pick a slot.', buttons: ['Book a slot'], sent: 963, readRate: 0.81 },
      { id: 't3', name: 'visit_reminder', category: 'Utility', language: 'English', status: 'Approved', header: 'none', body: 'Reminder: your campus visit for {{1}} is scheduled on {{2}} at {{3}}. Location: Greenfield Academy, Sector V, Salt Lake. Reply R to reschedule.', buttons: ['Get directions', 'Reschedule'], sent: 412, readRate: 0.94 },
      { id: 't4', name: 'fee_structure_share', category: 'Utility', language: 'English', status: 'Approved', header: 'document', body: 'Hi {{1}}, please find the fee structure for {{2}} attached. Early-bird admissions get a 10% waiver on the admission fee till {{3}}.', buttons: ['Talk to counsellor'], sent: 688, readRate: 0.9 },
      { id: 't5', name: 'open_house_2027', category: 'Marketing', language: 'English', status: 'Approved', header: 'image', body: '🎉 Open House 2027 — meet our principal & faculty this Saturday, 10 AM. Interactive sessions for {{2}} parents. Limited seats!', buttons: ['Reserve my seat'], sent: 1240, readRate: 0.75 },
      { id: 't6', name: 'early_bird_offer', category: 'Marketing', language: 'English', status: 'Pending', header: 'image', body: 'Admissions 2027 are open! Apply before {{1}} and get 10% off on the admission fee. Seats are limited for {{2}}.', buttons: ['Apply now'], sent: 0, readRate: 0 },
      { id: 't7', name: 'application_deadline', category: 'Utility', language: 'English', status: 'Approved', header: 'none', body: 'Hi {{1}}, the last date to submit the application for {{2}} is {{3}}. Complete your form here: {{4}}', buttons: ['Complete application'], sent: 205, readRate: 0.92 },
      { id: 't8', name: 'results_showcase_bn', category: 'Marketing', language: 'Bengali', status: 'Rejected', header: 'video', body: 'আমাদের বোর্ড পরীক্ষার ফলাফল দেখুন! ১০০% পাস, ৪২ জন ছাত্র ৯৫%+ নম্বর পেয়েছে।', buttons: ['Watch video'], sent: 0, readRate: 0, rejectReason: 'Header video exceeds 16 MB limit' },
    ];

    const sequences = [
      { id: 's1', name: 'New enquiry welcome', trigger: 'New lead created (any source)', active: true, color: '#1a73e8', enrolled: 214, completed: 162, replyRate: 0.38, steps: [
        { kind: 'send', delay: 'Instantly', title: 'welcome_enquiry', detail: 'Template + quick-reply buttons' },
        { kind: 'send', delay: 'After 1 day', title: 'Virtual campus tour', detail: 'Video creative (2:10)' },
        { kind: 'condition', delay: '', title: 'If no reply', detail: 'Else → move to counsellor queue' },
        { kind: 'send', delay: 'After 3 days', title: 'Parent testimonials', detail: 'Image carousel' },
        { kind: 'task', delay: 'After 5 days', title: 'Counsellor call task', detail: 'Assigned to lead owner' }] },
      { id: 's2', name: 'Hot lead fast-track', trigger: 'AI marks lead as 🔥 Hot', active: true, color: '#d93025', enrolled: 58, completed: 41, replyRate: 0.71, steps: [
        { kind: 'task', delay: 'Instantly', title: 'Alert counsellor', detail: 'Push + WhatsApp alert to lead owner' },
        { kind: 'send', delay: 'Instantly', title: 'campus_visit_invite', detail: 'Image header + booking button' },
        { kind: 'send', delay: 'After 24 hours', title: 'fee_structure_share', detail: 'PDF document' },
        { kind: 'task', delay: 'After 48 hours', title: 'Escalate to Admissions Head', detail: 'If visit not booked' }] },
      { id: 's3', name: 'Campus visit reminders', trigger: 'Stage changes to Campus visit', active: true, color: '#188038', enrolled: 77, completed: 69, replyRate: 0.64, steps: [
        { kind: 'send', delay: '1 day before', title: 'visit_reminder', detail: 'With Google Maps location' },
        { kind: 'send', delay: '2 hours before', title: 'visit_reminder', detail: 'Short nudge' },
        { kind: 'send', delay: '2 hours after', title: 'Feedback + application link', detail: 'application_deadline' }] },
      { id: 's4', name: 'Warm lead nurture', trigger: 'AI marks lead as Warm', active: true, color: '#e37400', enrolled: 96, completed: 30, replyRate: 0.29, steps: [
        { kind: 'send', delay: 'Week 1', title: 'Board results & toppers', detail: 'Image creative' },
        { kind: 'send', delay: 'Week 2', title: 'Facilities walkthrough', detail: 'Video creative' },
        { kind: 'send', delay: 'Week 3', title: 'Scholarship & sibling offers', detail: 'Text + PDF' },
        { kind: 'condition', delay: '', title: 'If replied with intent', detail: 'AI re-qualifies → Hot fast-track' }] },
      { id: 's5', name: 'Cold lead re-engagement', trigger: 'AI marks lead as Cold', active: false, color: '#1967d2', enrolled: 133, completed: 12, replyRate: 0.08, steps: [
        { kind: 'send', delay: 'Monthly', title: 'open_house_2027', detail: 'Open House invite' },
        { kind: 'send', delay: 'Before deadline', title: 'early_bird_offer', detail: 'Pending Meta approval' }] },
      { id: 's6', name: 'Fee deadline nudges', trigger: 'Stage changes to Application', active: true, color: '#9334e6', enrolled: 39, completed: 22, replyRate: 0.55, steps: [
        { kind: 'send', delay: '7 days before deadline', title: 'application_deadline', detail: 'Utility template' },
        { kind: 'send', delay: '1 day before deadline', title: 'application_deadline', detail: 'Final reminder' },
        { kind: 'task', delay: 'On deadline', title: 'Counsellor call', detail: 'If fee unpaid' }] },
    ];

    const broadcasts = [
      { id: 'b1', name: 'Open House – Nov 2026', status: 'Completed', template: 'open_house_2027', audienceLabel: 'All open leads · Kolkata', sentAt: new Date(now - 6 * DAY).toISOString(), creative: { type: 'image', url: creativeSVG('Open House 2027', 'Saturday · 10 AM · Main Campus', '#1a73e8', '#0b57d0', '🏫') }, stats: { audience: 1240, sent: 1240, delivered: 1198, read: 932, replied: 214, clicked: 301, failed: 42 } },
      { id: 'b2', name: 'Class 11 Science – Board results', status: 'Completed', template: 'campus_visit_invite', audienceLabel: 'Program: Class 11 – Science', sentAt: new Date(now - 13 * DAY).toISOString(), creative: { type: 'image', url: creativeSVG('42 students scored 95%+', 'Class 12 Board Results 2026', '#188038', '#0d652d', '🏆') }, stats: { audience: 386, sent: 386, delivered: 379, read: 318, replied: 71, clicked: 112, failed: 7 } },
      { id: 'b3', name: 'Diwali greetings + Early-bird teaser', status: 'Completed', template: 'welcome_enquiry', audienceLabel: 'All contacts', sentAt: new Date(now - 20 * DAY).toISOString(), creative: { type: 'image', url: creativeSVG('Shubho Deepavali', 'Admissions 2027 opening soon', '#e37400', '#b06000', '🪔') }, stats: { audience: 2105, sent: 2105, delivered: 2032, read: 1610, replied: 188, clicked: 240, failed: 73 } },
      { id: 'b4', name: 'Early-bird fee waiver', status: 'Scheduled', template: 'early_bird_offer', audienceLabel: 'Warm + Hot leads', sentAt: new Date(now + 3 * DAY).toISOString(), creative: { type: 'image', url: creativeSVG('10% off admission fee', 'Apply before 30 November', '#9334e6', '#681da8', '🎓') }, stats: { audience: 512, sent: 0, delivered: 0, read: 0, replied: 0, clicked: 0, failed: 0 } },
    ];

    const media = [];
    const spend = { 'Meta Ads': 86500, 'Google Ads': 64200, 'Website Form': 0, 'Walk-in': 0, 'Referral': 0, 'JustDial': 12000, 'Event / Seminar': 25000 };
    const institution = { name: 'Greenfield Academy', type: 'K-12 School (CBSE)', city: 'Kolkata', session: '2027–28' };
    return { leads, followups, templates, sequences, broadcasts, media, ai, spend, institution, seq: 2000 };
  }

  let db = null;
  function load() {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) { db = JSON.parse(raw); return; } } catch (e) { /* storage unavailable */ }
    db = build();
  }
  // blob: URLs do not survive reloads — keep them out of storage
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(db, (k, v) => (typeof v === 'string' && v.startsWith('blob:') ? undefined : v))); } catch (e) { /* ignore */ } }
  function reset() { try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ } db = build(); return { ok: true }; }

  const clone = o => JSON.parse(JSON.stringify(o));
  const findLead = id => { const l = db.leads.find(x => x.id === id); if (!l) throw new Error('Lead not found: ' + id); return l; };
  const requalify = l => { const prev = l.ai && l.ai.temp; l.ai = AIEngine.score(l, db.ai); return prev !== l.ai.temp ? prev : null; };
  const summary = l => { const last = l.messages[l.messages.length - 1]; return { id: l.id, student: l.student, parent: l.parent, phone: l.phone, program: l.program, source: l.source, campaign: l.campaign, area: l.area, stage: l.stage, counsellorId: l.counsellorId, createdAt: l.createdAt, lastActivityAt: l.lastActivityAt, nextFollowUp: l.nextFollowUp, tags: l.tags, unread: l.unread, ai: { score: l.ai.score, temp: l.ai.temp }, lastMessage: last ? { text: last.text, from: last.from, at: last.at } : null, optedOut: l.optedOut }; };

  function matchSegment(seg) {
    return db.leads.filter(l => !l.optedOut
      && (!seg.temps || !seg.temps.length || seg.temps.includes(l.ai.temp))
      && (!seg.stages || !seg.stages.length || seg.stages.includes(l.stage))
      && (!seg.programs || !seg.programs.length || seg.programs.includes(l.program))
      && (!seg.sources || !seg.sources.length || seg.sources.includes(l.source))
      && (!seg.leadIds || !seg.leadIds.length || seg.leadIds.includes(l.id)));
  }

  function scheduleReply(l, emit) {
    if (Math.random() > 0.9) return;
    const hot = l.ai.temp !== 'cold' || Math.random() < 0.3;
    const line = fill(pick(hot ? LEAD_LINES[Math.random() < 0.6 ? 'hot' : 'warm'] : LEAD_LINES.cold), l);
    setTimeout(() => {
      const m = { id: uid('M'), from: 'lead', text: line, at: new Date().toISOString() };
      l.messages.push(m); l.unread = (l.unread || 0) + 1; l.lastActivityAt = m.at;
      const prev = db.ai.autoQualifyOnReply ? requalify(l) : null;
      if (prev) l.timeline.push({ at: m.at, icon: 'auto_awesome', text: `AI re-qualified: ${prev} → ${l.ai.temp} (score ${l.ai.score})` });
      save();
      emit('message', { leadId: l.id, message: m, lead: summary(l), tempChangedFrom: prev });
    }, 2500 + Math.random() * 3500);
  }

  const routes = [];
  const route = (method, pattern, fn) => routes.push([method, new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$'), fn]);

  route('GET', '/meta', () => ({ programs: PROGRAMS, sources: SOURCES, stages: STAGES.map(s => ({ id: s, label: STAGE_LABEL[s] })), counsellors: COUNSELLORS, institution: db.institution, whatsappNumber: API_CONFIG.whatsapp.displayNumber, whatsappConnected: true, user: { id: 'demo', name: 'Admissions Office', role: 'admin' }, triggers: DEMO_TRIGGERS }));

  route('GET', '/leads', (p, b, q) => {
    let r = db.leads;
    if (q.q) { const s = q.q.toLowerCase(); r = r.filter(l => (l.student + l.parent + l.phone + l.program + l.id + l.area).toLowerCase().includes(s)); }
    if (q.temp) r = r.filter(l => l.ai.temp === q.temp);
    if (q.stage) r = r.filter(l => l.stage === q.stage);
    if (q.source) r = r.filter(l => l.source === q.source);
    if (q.program) r = r.filter(l => l.program === q.program);
    if (q.counsellor) r = r.filter(l => l.counsellorId === q.counsellor);
    return r.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(summary);
  });
  route('GET', '/leads/:id', ([id]) => Object.assign(clone(findLead(id)), { windowOpen: true }));
  route('POST', '/leads', (p, d, q, emit) => {
    const now = new Date().toISOString();
    const l = Object.assign({ id: 'L' + (++db.seq + 1000), email: '', area: 'Kolkata', campaign: 'Manual entry', stage: 'new', counsellorId: COUNSELLORS[db.leads.length % 4].id, createdAt: now, lastActivityAt: now, nextFollowUp: new Date(Date.now() + 36e5).toISOString(), avgReplyMins: 60, tags: [], notes: [], messages: [], unread: 0, sequences: ['s1'], timeline: [], optedOut: false }, d);
    l.messages.push({ id: uid('M'), from: 'bot', text: fill(WELCOME, l), at: now, status: 'sent', type: 'template', template: 'welcome_enquiry' });
    l.timeline.push({ at: now, icon: 'person_add', text: `Enquiry captured from ${l.source}` }, { at: now, icon: 'smart_toy', text: 'Auto-reply sent: welcome_enquiry · enrolled in “New enquiry welcome”' });
    l.ai = AIEngine.score(l, db.ai);
    db.leads.unshift(l);
    db.followups.push({ id: uid('F'), leadId: l.id, type: 'call', due: l.nextFollowUp, note: 'First call within 1 hour of enquiry', done: false, owner: l.counsellorId, auto: true });
    save(); scheduleReply(l, emit);
    return clone(l);
  });
  route('PATCH', '/leads/:id', ([id], patch) => {
    const l = findLead(id); const now = new Date().toISOString();
    if (patch.stage && patch.stage !== l.stage) { l.timeline.push({ at: now, icon: 'swap_horiz', text: `Stage: ${STAGE_LABEL[l.stage]} → ${STAGE_LABEL[patch.stage]}` }); }
    if (patch.counsellorId && patch.counsellorId !== l.counsellorId) l.timeline.push({ at: now, icon: 'person', text: `Reassigned to ${COUNSELLORS.find(c => c.id === patch.counsellorId).name}` });
    Object.assign(l, patch);
    if (patch.unread === undefined) l.lastActivityAt = now;
    if (patch.stage) requalify(l);
    save(); return clone(l);
  });
  route('POST', '/leads/:id/notes', ([id], { text }) => { const l = findLead(id); const n = { id: uid('N'), text, at: new Date().toISOString(), by: 'You' }; l.notes.unshift(n); l.timeline.push({ at: n.at, icon: 'sticky_note_2', text: 'Note: ' + text }); save(); return n; });
  route('POST', '/leads/import', (p, { rows }, q, emit) => { const created = rows.map(r => routes.find(x => x[0] === 'POST' && x[1].test('/leads'))[2]([], Object.assign({ source: 'Website Form' }, r), {}, emit)); return { imported: created.length }; });
  route('POST', '/leads/qualify', () => {
    const changes = { hot: 0, warm: 0, cold: 0, changed: 0 };
    db.leads.forEach(l => { const prev = requalify(l); if (prev) { changes.changed++; l.timeline.push({ at: new Date().toISOString(), icon: 'auto_awesome', text: `AI re-qualified: ${prev} → ${l.ai.temp}` }); } changes[l.ai.temp]++; });
    save(); return changes;
  });
  route('POST', '/leads/:id/qualify', ([id]) => { const l = findLead(id); const prev = requalify(l); l.timeline.push({ at: new Date().toISOString(), icon: 'auto_awesome', text: `AI qualification run → ${l.ai.temp} (${l.ai.score})` }); save(); return Object.assign(clone(l.ai), { previous: prev }); });

  route('GET', '/conversations', () => db.leads.filter(l => l.messages.length).map(summary).sort((a, b) => (b.lastMessage.at).localeCompare(a.lastMessage.at)));
  route('GET', '/leads/:id/messages', ([id]) => { const l = findLead(id); l.unread = 0; save(); return clone(l.messages); });
  route('POST', '/leads/:id/messages', ([id], msg, q, emit) => {
    const l = findLead(id);
    const m = { id: uid('M'), from: 'agent', text: msg.text || '', type: msg.type || 'text', template: msg.template, media: msg.media, at: new Date().toISOString(), status: 'sent' };
    l.messages.push(m); l.lastActivityAt = m.at; save();
    setTimeout(() => { m.status = 'delivered'; emit('status', { leadId: id, messageId: m.id, status: 'delivered' }); }, 900);
    setTimeout(() => { m.status = 'read'; save(); emit('status', { leadId: id, messageId: m.id, status: 'read' }); }, 2200);
    scheduleReply(l, emit);
    return clone(m);
  });

  route('GET', '/followups', () => db.followups.map(f => { const l = db.leads.find(x => x.id === f.leadId); return Object.assign({}, f, { lead: l ? summary(l) : null }); }));
  route('POST', '/followups', (p, d) => { const f = Object.assign({ id: uid('F'), done: false, auto: false }, d); db.followups.push(f); const l = db.leads.find(x => x.id === d.leadId); if (l) { l.nextFollowUp = d.due; l.timeline.push({ at: new Date().toISOString(), icon: 'event', text: `Follow-up scheduled (${d.type}) for ${new Date(d.due).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}` }); } save(); return f; });
  route('PATCH', '/followups/:id', ([id], patch) => { const f = db.followups.find(x => x.id === id); Object.assign(f, patch); if (patch.done) { const l = db.leads.find(x => x.id === f.leadId); if (l) l.timeline.push({ at: new Date().toISOString(), icon: 'task_alt', text: 'Follow-up done: ' + f.note }); } save(); return f; });

  route('GET', '/sequences', () => clone(db.sequences).map(x => Object.assign(x, { triggerKey: x.triggerKey || x.trigger, trigger: (DEMO_TRIGGERS.find(t => t.id === x.trigger) || {}).label || x.trigger })));
  route('POST', '/sequences', (p, d) => { d.steps = (d.steps || []).map(x => Object.assign({}, x, { delay: x.delayLabel || x.delay, title: x.title || x.template, detail: x.detail || (x.kind === 'send' ? 'WhatsApp template' : '') })); const s = Object.assign({ id: uid('s'), active: true, enrolled: 0, completed: 0, replyRate: 0, color: '#1a73e8' }, d); db.sequences.push(s); save(); return s; });
  route('PATCH', '/sequences/:id', ([id], patch) => { const s = db.sequences.find(x => x.id === id); Object.assign(s, patch); save(); return s; });
  route('POST', '/sequences/:id/enroll', ([id], { leadIds }) => { const s = db.sequences.find(x => x.id === id); leadIds.forEach(lid => { const l = db.leads.find(x => x.id === lid); if (l && !l.sequences.includes(id)) { l.sequences.push(id); s.enrolled++; l.timeline.push({ at: new Date().toISOString(), icon: 'conversion_path', text: `Enrolled in “${s.name}”` }); } }); save(); return { ok: true, enrolled: s.enrolled }; });

  route('GET', '/templates', () => clone(db.templates));
  route('POST', '/templates', (p, d) => { const t = Object.assign({ id: uid('t'), status: 'Pending', sent: 0, readRate: 0, language: 'English', buttons: [] }, d); db.templates.unshift(t); save(); return t; });

  route('POST', '/media', (p, d) => { const m = { id: uid('MED'), name: d.name, type: (d.type || '').split('/')[0] || 'document', mime: d.type, size: d.size, url: d.url }; db.media.push(m); return m; });

  route('POST', '/broadcasts/audience', (p, seg) => { const r = matchSegment(seg); return { count: r.length, sample: r.slice(0, 5).map(summary) }; });
  route('GET', '/broadcasts', () => clone(db.broadcasts));
  route('POST', '/broadcasts', (p, d) => { const aud = matchSegment(d.segment || {}); const b = Object.assign({ id: uid('b'), status: d.scheduleAt ? 'Scheduled' : 'Draft', sentAt: d.scheduleAt || null, stats: { audience: aud.length, sent: 0, delivered: 0, read: 0, replied: 0, clicked: 0, failed: 0 } }, d); db.broadcasts.unshift(b); save(); return clone(b); });
  route('POST', '/broadcasts/:id/send', ([id], b, q, emit) => {
    const bc = db.broadcasts.find(x => x.id === id); bc.status = 'Sending'; bc.sentAt = new Date().toISOString();
    const aud = matchSegment(bc.segment || {}); const n = bc.stats.audience = aud.length || bc.stats.audience;
    const target = { sent: n, failed: Math.round(n * 0.03), delivered: Math.round(n * 0.96), read: Math.round(n * 0.74), clicked: Math.round(n * 0.22), replied: Math.round(n * 0.15) };
    let step = 0; const steps = 12;
    const tick = () => {
      step++; const k = step / steps;
      for (const key in target) bc.stats[key] = Math.round(target[key] * Math.min(1, key === 'sent' || key === 'failed' ? k * 2 : key === 'delivered' ? k * 1.6 : k));
      if (step >= steps) { bc.status = 'Completed'; aud.forEach(l => { l.timeline.push({ at: bc.sentAt, icon: 'campaign', text: `Broadcast received: ${bc.name}` }); }); save(); }
      emit('broadcast', clone(bc));
      if (step < steps) setTimeout(tick, 650);
    };
    setTimeout(tick, 400);
    save(); return clone(bc);
  });

  route('GET', '/reports/overview', (p, b, q) => {
    const now = Date.now(); const days = { '7d': 7, '30d': 30, '90d': 90 }[q.range || '30d'] || 30;
    const from = now - days * DAY; const prevFrom = from - days * DAY;
    const inR = db.leads.filter(l => new Date(l.createdAt).getTime() >= from);
    const prevR = db.leads.filter(l => { const t = new Date(l.createdAt).getTime(); return t >= prevFrom && t < from; });
    const reached = (l, s) => l.stage !== 'lost' ? STAGES.indexOf(l.stage) >= STAGES.indexOf(s) : s === 'new' || s === 'contacted';
    const funnel = ['new', 'contacted', 'counselling', 'visit', 'application', 'admitted'].map(s => ({ stage: s, label: STAGE_LABEL[s], count: inR.filter(l => reached(l, s)).length }));
    const series = [];
    for (let d = days - 1; d >= 0; d--) {
      const start = new Date(now - d * DAY); start.setHours(0, 0, 0, 0); const end = start.getTime() + DAY;
      const ls = db.leads.filter(l => { const t = new Date(l.createdAt).getTime(); return t >= start.getTime() && t < end; });
      series.push({ date: start.toISOString(), total: ls.length, hot: ls.filter(l => l.ai.temp === 'hot').length });
    }
    const bySource = SOURCES.map(s => { const ls = inR.filter(l => l.source === s); const adm = ls.filter(l => l.stage === 'admitted').length; const sp = Math.round(db.spend[s] * days / 30); return { source: s, leads: ls.length, hot: ls.filter(l => l.ai.temp === 'hot').length, admitted: adm, spend: sp, cpl: ls.length && sp ? Math.round(sp / ls.length) : 0, cpa: adm && sp ? Math.round(sp / adm) : 0 }; });
    const byProgram = PROGRAMS.map(pr => { const ls = inR.filter(l => l.program === pr); return { program: pr, leads: ls.length, admitted: ls.filter(l => l.stage === 'admitted').length }; });
    const counsellors = COUNSELLORS.map(c => { const ls = inR.filter(l => l.counsellorId === c.id); const adm = ls.filter(l => l.stage === 'admitted').length; const fu = db.followups.filter(f => f.owner === c.id); return { id: c.id, name: c.name, initials: c.initials, color: c.color, leads: ls.length, hot: ls.filter(l => l.ai.temp === 'hot').length, visits: ls.filter(l => reached(l, 'visit')).length, admitted: adm, conv: ls.length ? adm / ls.length : 0, followupsDone: fu.filter(f => f.done).length, overdue: fu.filter(f => !f.done && new Date(f.due).getTime() < now).length, firstResponse: [4, 11, 7, 16][COUNSELLORS.indexOf(c)] }; });
    const temp = { hot: inR.filter(l => l.ai.temp === 'hot').length, warm: inR.filter(l => l.ai.temp === 'warm').length, cold: inR.filter(l => l.ai.temp === 'cold').length };
    const admitted = inR.filter(l => l.stage === 'admitted').length;
    const prevAdm = prevR.filter(l => l.stage === 'admitted').length;
    const msgs = inR.flatMap(l => l.messages);
    const outbound = msgs.filter(m => m.from !== 'lead').length; const inbound = msgs.filter(m => m.from === 'lead').length;
    const bcs = db.broadcasts.filter(x => x.status === 'Completed');
    return {
      range: q.range || '30d', days,
      kpis: { leads: inR.length, leadsPrev: prevR.length, admitted, admittedPrev: prevAdm, conversion: inR.length ? admitted / inR.length : 0, hot: temp.hot, replyRate: outbound ? Math.min(1, inbound / outbound) : 0, botFirstResponseSec: 38, spend: bySource.reduce((a, s) => a + s.spend, 0) },
      series, funnel, bySource, byProgram, counsellors, temp,
      whatsapp: { outbound, inbound, broadcasts: bcs.map(x => ({ name: x.name, ...x.stats })) },
    };
  });

  route('GET', '/auth/me', () => ({ user: { id: 'demo', name: 'Admissions Office', email: 'demo@k3solutions.in', role: 'admin' }, role: 'admin', tenant: { name: db.institution.name } }));
  route('POST', '/templates/sync', () => ({ synced: db.templates.length, templates: clone(db.templates) }));
  route('DELETE', '/sequences/:id', ([id]) => { db.sequences = db.sequences.filter(s => s.id !== id); save(); return null; });
route('PATCH', '/templates/:id', ([id], d) => { const t = db.templates.find(x => x.id === id); if (Array.isArray(d.varMap)) t.varMap = d.varMap; save(); return clone(t); });
  route('GET', '/templates/variables', () => ({ sources: { parent_first: 'Parent first name', parent_full: 'Parent full name', student_first: 'Student first name', student_full: 'Student full name', program: 'Program / class', phone: 'Phone number', area: 'Area / city', counsellor: 'Counsellor name', institution: 'Institution name', session: 'Admission session', deadline: 'Deadline text (Settings)', apply_link: 'Application link (Settings)' }, defaults: ['parent_first', 'program', 'deadline', 'apply_link', 'institution'], customFields: [...new Set(db.leads.flatMap(l => Object.keys(l.custom || {})))] }));
  route('GET', '/broadcasts/:id/failed', ([id]) => { const b = db.broadcasts.find(x => x.id === id); return Array.from({ length: Math.min(25, b.stats.failed) }, (_, i) => { const l = db.leads[i % db.leads.length]; return { leadId: l.id, parent: l.parent, phone: l.phone, attempts: 1, error: i % 3 ? '(#131026) Message undeliverable — number not on WhatsApp' : 'Gave up after 6 attempts: (#130429) Rate limit hit', retrying: false }; }); });
  route('POST', '/broadcasts/:id/retry-failed', ([id]) => { const b = db.broadcasts.find(x => x.id === id); const n = b.stats.failed; b.stats.delivered += Math.round(n * 0.8); b.stats.sent += 0; b.stats.failed = n - Math.round(n * 0.8); save(); return Object.assign(clone(b), { requeued: n }); });
    route('POST', '/ai/classify', (p, { text }) => AIEngine.classify(text));
  route('GET', '/ai/config', () => clone(db.ai));
  route('PUT', '/ai/config', (p, cfg) => { db.ai = Object.assign(db.ai, cfg); save(); return clone(db.ai); });

  function handle(method, fullPath, body, emit) {
    if (!db) load();
    const [path, query] = fullPath.split('?');
    const q = {}; (query || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[k] = decodeURIComponent(v || ''); });
    for (const [m, re, fn] of routes) {
      if (m !== method) continue;
      const match = path.match(re);
      if (match) return fn(match.slice(1), body || {}, q, emit);
    }
    throw new Error(`Demo API: no route for ${method} ${path}`);
  }
  return { handle, reset, creativeSVG };
})();

/* Sample creatives for the demo broadcast composer */
const DemoAssets = { creative: (...a) => MockServer.creativeSVG(...a) };
window.MockServer = MockServer; window.DemoAssets = DemoAssets; window.AIEngine = AIEngine;
