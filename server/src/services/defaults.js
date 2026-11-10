/* Default content seeded for every new institution */
const STEP = (kind, delayMinutes, delayLabel, title, detail, extra = {}) => Object.assign({ kind, delayMinutes, delayLabel, title, detail }, extra);

const TRIGGERS = [
  ['lead_created', 'New lead created (any source)'],
  ['temp:hot', 'AI marks lead as 🔥 Hot'], ['temp:warm', 'AI marks lead as Warm'], ['temp:cold', 'AI marks lead as Cold'],
  ['stage:contacted', 'Stage changes to Contacted'], ['stage:counselling', 'Stage changes to Counselling'], ['stage:visit', 'Stage changes to Campus visit'], ['stage:application', 'Stage changes to Application'], ['stage:admitted', 'Stage changes to Admitted'],
  ['source:Meta Ads', 'Lead source is Meta Ads'], ['source:Google Ads', 'Lead source is Google Ads'], ['source:Website Form', 'Lead source is Website Form'], ['source:WhatsApp', 'Lead messaged on WhatsApp first'],
  ['manual', 'Manual enrolment only'],
];
const triggerLabel = k => (TRIGGERS.find(t => t[0] === k) || [k, k])[1];

const SEQUENCES = [
  { name: 'New enquiry welcome', trigger: 'lead_created', color: '#1a73e8', steps: [
    STEP('send', 1440, 'After 1 day', 'campus_visit_invite', 'Invite to a campus visit', { template: 'campus_visit_invite' }),
    STEP('condition', 0, '', 'If no reply', 'Stop if the parent has replied'),
    STEP('send', 2880, 'After 2 days', 'fee_structure_share', 'Share the fee structure', { template: 'fee_structure_share' }),
    STEP('task', 2880, 'After 2 days', 'Counsellor call task', 'Assigned to lead owner', { taskType: 'call' })] },
  { name: 'Hot lead fast-track', trigger: 'temp:hot', color: '#d93025', steps: [
    STEP('send', 0, 'Instantly', 'campus_visit_invite', 'Image header + booking button', { template: 'campus_visit_invite' }),
    STEP('send', 1440, 'After 1 day', 'fee_structure_share', 'PDF document', { template: 'fee_structure_share' }),
    STEP('task', 1440, 'After 1 day', 'Escalate to Admissions Head', 'If visit not booked', { taskType: 'call' })] },
  { name: 'Campus visit reminders', trigger: 'stage:visit', color: '#188038', steps: [
    STEP('send', 0, 'Instantly', 'visit_reminder', 'Visit confirmation with location', { template: 'visit_reminder' }),
    STEP('send', 2880, 'After 2 days', 'application_deadline', 'Feedback + application link', { template: 'application_deadline' })] },
  { name: 'Warm lead nurture', trigger: 'temp:warm', color: '#e37400', steps: [
    STEP('send', 4320, 'After 3 days', 'open_house_invite', 'Open House invite', { template: 'open_house_invite' }),
    STEP('condition', 0, '', 'If no reply', 'Stop if the parent has replied'),
    STEP('send', 10080, 'After 1 week', 'fee_structure_share', 'Fee structure + scholarships', { template: 'fee_structure_share' })] },
  { name: 'Cold lead re-engagement', trigger: 'temp:cold', color: '#1967d2', steps: [
    STEP('send', 20160, 'After 2 weeks', 'open_house_invite', 'Open House invite', { template: 'open_house_invite' })] },
  { name: 'Fee deadline nudges', trigger: 'stage:application', color: '#9334e6', steps: [
    STEP('send', 0, 'Instantly', 'application_deadline', 'Deadline reminder', { template: 'application_deadline' }),
    STEP('task', 4320, 'After 3 days', 'Counsellor call', 'If fee unpaid', { taskType: 'call' })] },
];

/* Recommended WhatsApp templates (submitted to Meta in one click from Templates) */
const TEMPLATES = [
  { name: 'welcome_enquiry', category: 'Utility', language: 'en', header: 'none', body: 'Hi {{1}}, thank you for your enquiry about {{2}} admissions at our institution. A counsellor will contact you shortly. Reply here with any questions.', buttons: ['Fee structure', 'Book campus visit', 'Talk to counsellor'] },
  { name: 'campus_visit_invite', category: 'Marketing', language: 'en', header: 'none', body: 'Dear {{1}}, we would love to show you our classrooms, labs and sports facilities for {{2}}. Campus tours run Monday to Saturday, 10 AM to 1 PM. Tap below to book a slot.', buttons: ['Book a visit'] },
  { name: 'visit_reminder', category: 'Utility', language: 'en', header: 'none', body: 'Hi {{1}}, this is a confirmation of your campus visit for {{2}}. Please reply with your preferred date and time, or tap Reschedule.', buttons: ['Confirm', 'Reschedule'] },
  { name: 'fee_structure_share', category: 'Utility', language: 'en', header: 'none', body: 'Hi {{1}}, as requested, here are the fee details for {{2}}. The early-bird benefit is valid till {{3}}. Reply to speak with a counsellor.', buttons: ['Talk to counsellor'] },
  { name: 'open_house_invite', category: 'Marketing', language: 'en', header: 'none', body: 'Dear {{1}}, you are invited to our Open House! Meet our principal and faculty and learn about {{2}} admissions. Limited seats.', buttons: ['Reserve my seat'] },
  { name: 'application_deadline', category: 'Utility', language: 'en', header: 'none', body: 'Hi {{1}}, the last date to submit the application for {{2}} is {{3}}. Complete your application here: {{4}} — we are happy to help with any questions.', buttons: ['Talk to counsellor'] },
];

module.exports = { SEQUENCES, TEMPLATES, TRIGGERS, triggerLabel };
