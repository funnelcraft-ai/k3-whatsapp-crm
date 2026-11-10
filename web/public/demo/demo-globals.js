/* globals the demo MockServer expects */
window.API_CONFIG = { mode: 'demo', baseUrl: '/api/v1', latency: [150, 450], whatsapp: { provider: 'Meta WhatsApp Cloud API', phoneNumberId: '', wabaId: '', displayNumber: '+91 82404 72003' } };
var API_CONFIG = window.API_CONFIG;
var STAGES = ['new', 'contacted', 'counselling', 'visit', 'application', 'admitted', 'lost'];
var STAGE_LABEL = { new: 'New enquiry', contacted: 'Contacted', counselling: 'Counselling', visit: 'Campus visit', application: 'Application', admitted: 'Admitted', lost: 'Lost' };
