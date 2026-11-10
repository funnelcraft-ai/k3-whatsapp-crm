/* Creates a demo institution with sample data.  Usage: node server/scripts/seed-demo.js [admin-email] [password] */
const { migrate, pool } = require('../src/core');
const { seedDemo } = require('../src/services/demo');
(async () => {
  await migrate();
  const r = await seedDemo(process.argv[2], process.argv[3]);
  console.log(`Demo institution ready → sign in as ${r.email} / ${r.password} (counsellors: ${r.counsellors.join(', ')})`);
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
