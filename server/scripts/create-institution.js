/* CLI: create an institution + its admin login.
   node server/scripts/create-institution.js "School name" admin@school.in "TempPass@123" [plan] [city] */
const { migrate, pool } = require('../src/core');
const { createTenant } = require('../src/routes/admin');
const [name, email, password, plan = 'Starter', city = ''] = process.argv.slice(2);
if (!name || !email || !password) { console.log('Usage: node server/scripts/create-institution.js "School name" admin@school.in "TempPass@123" [plan] [city]'); process.exit(1); }
(async () => { await migrate(); const t = await createTenant({ name, city, plan, admin: { name: 'Admin', email, password } }); console.log('Created', t.name, '→ admin login:', email); await pool.end(); })()
  .catch(e => { console.error(e.message); process.exit(1); });
