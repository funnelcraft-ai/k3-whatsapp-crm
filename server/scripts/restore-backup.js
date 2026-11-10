/* Restore a K3 CRM backup — REPLACES all data in the database.
   node server/scripts/restore-backup.js <file.jsonl.gz | s3:backups/k3crm-….jsonl.gz> --yes */
const fs = require('fs');
const { migrate, pool } = require('../src/core');
const Backup = require('../src/services/backup');
const Storage = require('../src/services/storage');
(async () => {
  const src = process.argv[2];
  if (!src || !process.argv.includes('--yes')) { console.log('Usage: node server/scripts/restore-backup.js <backup file or s3:key> --yes\nThis REPLACES all current data.'); process.exit(1); }
  await migrate();
  const input = src.startsWith('s3:') ? await Storage.s3GetStream(process.env.BACKUP_S3_BUCKET || process.env.S3_BUCKET, src.slice(3)) : fs.createReadStream(src);
  const r = await Backup.restore(input);
  console.log('Restored backup from', r.createdAt); console.table(r.counts); await pool.end();
})().catch(e => { console.error('Restore failed:', e.message); process.exit(1); });
