/* File storage for creatives and inbound WhatsApp media.
   STORAGE_DRIVER=db  (default) → local disk cache + a copy in PostgreSQL (works on any host, incl. ephemeral disks)
   STORAGE_DRIVER=s3            → any S3-compatible object storage: AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces…
     S3_BUCKET, S3_REGION (auto for R2), S3_ENDPOINT (R2/MinIO), S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_FORCE_PATH_STYLE=true (MinIO)
   Files are always served through /uploads/<name> (private bucket is fine), with a local disk cache. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { config, q, one, HttpError } = require('../core');

const DRIVER = (process.env.STORAGE_DRIVER || 'db').toLowerCase();
let s3 = null, S3cmd = null;
function client() {
  if (s3) return s3;
  const sdk = require('@aws-sdk/client-s3');
  S3cmd = sdk;
  s3 = new sdk.S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
  });
  return s3;
}
const bucket = () => { if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET is not set'); return process.env.S3_BUCKET; };
/* Only file types WhatsApp can carry are stored, and the served Content-Type comes from the extension we choose — never from the uploader.
   (Uploading .html / .svg / .js would otherwise give an attacker script execution on our origin.) */
const TYPES = {
  '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.3gp': 'video/3gpp',
  '.aac': 'audio/aac', '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.amr': 'audio/amr', '.ogg': 'audio/ogg', '.opus': 'audio/ogg',
  '.pdf': 'application/pdf', '.doc': 'application/msword', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation', '.txt': 'text/plain',
};
const BY_MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'video/mp4': '.mp4', 'video/3gpp': '.3gp', 'audio/aac': '.aac', 'audio/mp4': '.m4a', 'audio/mpeg': '.mp3', 'audio/amr': '.amr', 'audio/ogg': '.ogg', 'audio/opus': '.opus', 'application/pdf': '.pdf', 'application/msword': '.doc', 'application/vnd.ms-excel': '.xls', 'application/vnd.ms-powerpoint': '.ppt', 'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx' };
const baseMime = m => String(m || '').split(';')[0].trim().toLowerCase();
const extOf = (name, mime) => { const e = path.extname(name || '').toLowerCase(); if (e === '.jpeg') return '.jpg'; return TYPES[e] ? e : (BY_MIME[baseMime(mime)] || '.bin'); };
const allowedMime = mime => !!BY_MIME[baseMime(mime)];
const mimeForName = name => TYPES[path.extname(String(name || '')).toLowerCase()] || 'application/octet-stream';
const cachePath = key => path.join(config.uploadDir, path.basename(key));

/* Save a file → returns { path, storage, data } ready for the media table */
async function save(tenantId, buffer, { name, mime }) {
  const fname = crypto.randomBytes(12).toString('hex') + extOf(name, mime);
  try { fs.writeFileSync(path.join(config.uploadDir, fname), buffer); } catch (e) { /* cache only */ }
  if (DRIVER === 's3') {
    const key = `${tenantId}/${fname}`;
    client(); await s3.send(new S3cmd.PutObjectCommand({ Bucket: bucket(), Key: key, Body: buffer, ContentType: mime || 'application/octet-stream' }));
    return { path: key, storage: 's3', data: null };
  }
  return { path: fname, storage: 'db', data: buffer };
}

/* Read file bytes for a media row (cache → S3 / DB) */
async function read(row) {
  const p = cachePath(row.path);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  let buf;
  if (row.storage === 's3') {
    client(); const r = await s3.send(new S3cmd.GetObjectCommand({ Bucket: bucket(), Key: row.path }));
    buf = Buffer.from(await r.Body.transformToByteArray());
  } else {
    const r = row.data ? row : await one(`SELECT data FROM media WHERE id=$1`, [row.id]);
    if (!r || !r.data) throw new HttpError(410, 'Media file is no longer available');
    buf = r.data;
  }
  try { fs.writeFileSync(p, buf); } catch (e) { /* read-only disk is fine */ }
  return buf;
}
/* Path on local disk (downloads into the cache when needed) — used for WhatsApp uploads */
async function localFile(row) { const p = cachePath(row.path); if (!fs.existsSync(p)) fs.writeFileSync(p, await read(row)); return p; }

/* generic S3 helpers (also used for backups) */
async function s3Put(bucketName, key, body, contentType) { client(); await s3.send(new S3cmd.PutObjectCommand({ Bucket: bucketName, Key: key, Body: body, ContentType: contentType || 'application/octet-stream' })); }
async function s3GetStream(bucketName, key) { client(); const r = await s3.send(new S3cmd.GetObjectCommand({ Bucket: bucketName, Key: key })); return r.Body; }
async function s3List(bucketName, prefix) { client(); const r = await s3.send(new S3cmd.ListObjectsV2Command({ Bucket: bucketName, Prefix: prefix, MaxKeys: 1000 })); return (r.Contents || []).map(o => ({ key: o.Key, size: o.Size, modified: o.LastModified })); }
async function s3Delete(bucketName, key) { client(); await s3.send(new S3cmd.DeleteObjectCommand({ Bucket: bucketName, Key: key })); }

module.exports = { DRIVER, extOf, allowedMime, mimeForName, TYPES, save, read, localFile, s3Put, s3GetStream, s3List, s3Delete };
