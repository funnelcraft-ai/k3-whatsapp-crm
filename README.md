# K3 Solutions — WhatsApp Admissions CRM

This is a multi-school SaaS CRM for schools, colleges and coaching institutes. It sends and receives WhatsApp messages through the **Meta WhatsApp Cloud API**, captures leads from Meta and Google Ads, website forms, CSV imports and inbound WhatsApp, and qualifies each lead as **Hot / Warm / Cold** with AI. It also runs nurture sequences, follow-up tasks and broadcasts with creatives, and includes reporting.

The web app is built with **Angular + Angular Material 3** (Google’s Material You design system), and the product is ready to sell: institutions can sign up for a **free trial**, **pay you through Razorpay** (subscriptions or a one-time licence, with GST invoices), connect WhatsApp with **one click** (Meta Embedded Signup), and every institution’s data is **backed up automatically every night**.

Everything is built and tested end to end. To go live you only need to add **your server and credentials** (database, domain, Meta WhatsApp keys, Razorpay keys).

---

## What's included

| Area | Features |
|---|---|
| **Multi-school SaaS** | One deployment for many institutions. Each has its own data, users, WhatsApp number and settings. The K3 platform admin creates institutions, sets plans and limits (users, contacts, expiry), can suspend accounts, and can open any institution in **support mode** |
| **Logins & roles** | Email + password (bcrypt, 12-hour JWT sessions, login throttling). Roles: **Platform admin**, **Institution admin**, **Counsellor** (sees only their own leads unless the admin allows all) |
| **WhatsApp (Meta Cloud API)** | Send text, approved templates (with `{{1}}…{{5}}` personalisation and image/video/document headers) and media. Receive messages, media, button clicks and delivery/read/failed statuses. The 24-hour window is enforced. STOP/START opt-out is handled. Webhooks are verified with signatures |
| **Templates** | Sync templates & approval status from Meta, submit new templates (including media-header samples), submit a 6-template admissions starter set in one click, and receive approval updates by webhook |
| **Lead capture** | Website form webhook (+ embed snippet), **Meta Lead Ads** (`leadgen`), **Google Ads lead form** webhook, inbound WhatsApp from unknown numbers, CSV import, manual entry. Duplicates are matched on phone number. New leads are auto-assigned round-robin to counsellors |
| **AI qualification** | A transparent 0–100 score from intent keywords, engagement, reply speed, source, stage and recency, with reasons and a next best action. Leads are re-scored on every reply. Adjustable weights and thresholds. Optional Claude-powered message classification and suggested replies (`ANTHROPIC_API_KEY`) |
| **Automation** | Nurture sequences triggered by new lead, AI temperature, stage or source (template sends, counsellor tasks, stop-if-replied). An instant welcome template. Hot-lead fast-track call tasks |
| **Broadcasts** | Segment by temperature, stage, program and source (or hand-picked leads), choose a template, upload a creative or use a starter one, send now or schedule. Sending is throttled and multi-instance safe, with live delivered/read/replied/clicked stats |
| **Inbox & follow-ups** | Realtime WhatsApp inbox (Server-Sent Events), AI reply suggestions, notes, timeline, call logging, follow-up tasks (overdue/today/upcoming) |
| **Material 3 web app** | Angular 22 + Angular Material 3: navigation drawer → navigation rail → modal drawer as the screen shrinks, side-sheet lead profile (full screen on phones), kanban with drag & drop, chips, segmented buttons, M3 dialogs and snackbars. Tested at 360 / 390 / 768 / 1024 / 1280 / 1920 px with no sideways scrolling |
| **Billing (Razorpay)** | Plans you set in the platform console (monthly, yearly or one-time licence, prices ex-GST). Institutions pay in **Settings → Plan & billing** with UPI, cards or netbanking through Razorpay Checkout. Signatures and webhooks are verified, renewals extend access automatically, failed renewals get a grace period, and lapsed accounts are locked except for the billing screen. Numbered **GST tax invoices** (CGST+SGST or IGST) for every payment |
| **WhatsApp one-click signup** | Meta Embedded Signup: the school logs in with Facebook, picks or creates its WhatsApp Business Account and verifies its number. The server exchanges the code, subscribes your app to the WABA, registers the number and syncs templates. Manual credential entry is still available |
| **Automated backups** | Nightly gzip snapshot of the whole database (including uploaded files) to S3 / Cloudflare R2 or disk, kept for 14 days, with **Back up now**, download and a one-command restore |
| **Reports** | Funnel, enquiry trend, temperature mix, source ROI (cost per lead and per admission from your ad spend), program demand, counsellor performance, broadcast results, CSV download |

---

## Project layout

```
k3-whatsapp-crm/
├── server.js                  entry file (Hostinger / any Node host)
├── server/                    Node.js (Express) + PostgreSQL backend
│   ├── src/index.js           HTTP server, security headers, routing, bootstrap
│   ├── src/core.js            config, DB pool & migrations, AES-256-GCM secrets, realtime hub, helpers
│   ├── src/auth.js            login, JWT sessions, role guards, billing lock
│   ├── src/routes/            api.js (CRM) · admin.js (settings, team, platform) · billing.js (Razorpay) · webhooks.js
│   ├── src/services/          whatsapp.js · crm.js · ai.js · billing.js · backup.js · storage.js · demo.js
│   ├── src/worker.js          sequences, throttled broadcasts, retries, nightly backup
│   ├── src/migrations/        SQL schema (applied automatically)
│   ├── scripts/               seed-demo.js · create-institution.js · restore-backup.js
│   └── public/                the built web app (served by the server — already built in the zip)
├── web/                       Angular + Angular Material 3 source
│   ├── src/app/core/          API client, session, interceptors, utilities
│   ├── src/app/layout/        app shell (top app bar, navigation drawer / rail, banners)
│   ├── src/app/pages/         home, leads, inbox, follow-ups, nurture, broadcasts, templates, AI, reports, settings, platform
│   ├── src/app/shared/        lead side sheet, WhatsApp chat, charts, dialogs
│   └── public/demo/           in-browser demo API (used only by the demo build)
├── tests/                     api · ui (Playwright) · responsive · reliability · commercial · fake Meta & Razorpay
├── Dockerfile · docker-compose.yml · .env.example · hostinger.env.example
```

**Changing the web app:** `cd web && npm install && npm start` (dev server on :4200, proxies `/api` to :8080). `npm run build:web` (from the project root) writes the production build to `server/public/`; `npm run build:demo` writes the stand-alone sales demo to `web/dist/demo/`.

---

## Deploy

### Option A — VPS with Docker (recommended: Hostinger KVM, DigitalOcean, AWS Lightsail)
PostgreSQL, the CRM and automatic HTTPS (Caddy) all run on one server.

```bash
# on the VPS (Ubuntu) — install Docker, then:
git clone <your repo> k3crm && cd k3crm
cp .env.example .env          # fill DOMAIN, POSTGRES_PASSWORD, JWT_SECRET, ENCRYPTION_KEY, SUPER_ADMIN_*
docker compose up -d --build
```
Point your domain's **A record** at the VPS IP before starting, so Caddy can issue the SSL certificate. Then open `https://your-domain` and sign in with `SUPER_ADMIN_EMAIL`.

### Option B — Railway (or Render)
1. Create a project and add a **PostgreSQL** database.
2. Deploy this repo (Railway detects the `Dockerfile`).
3. Set the variables: `DATABASE_URL` (from the Postgres service), `DATABASE_SSL=true` if your provider requires it, `PUBLIC_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `NODE_ENV=production`.
4. Attach a **volume** at `/data/uploads`, so uploaded creatives and inbound media survive redeploys.
5. Add a custom domain.

The database schema is created automatically on first start (and when later migrations are added).

### Option C — Hostinger Business / Cloud web hosting (Node.js Web App)
Shared plans can run the app but not PostgreSQL, and they pause idle apps. So: use an external PostgreSQL (Neon or Supabase), and an every-minute cron job that runs the automations. Uploaded files are also stored in the database, so redeploys don't lose them.
1. Create a PostgreSQL database on Neon or Supabase (Mumbai/Singapore region) and copy its connection string.
2. hPanel → Websites → **Add website → Node.js Web App** → upload `k3-crm-hostinger-upload.zip`.
   Settings: **Application type** Express · **Node** 22 · **Build script** blank · **Output directory** blank · **Entry file** `server.js`.
3. **Environment variables → Import .env**: use `hostinger.env.example` filled in (DATABASE_URL, DATABASE_SSL=true, JWT_SECRET, ENCRYPTION_KEY, CRON_SECRET, PUBLIC_URL, SUPER_ADMIN_*, and the RAZORPAY_* / BACKUP_S3_BUCKET + S3_* keys). Deploy. The zip already contains the built web app — no build step is needed on Hostinger.
4. hPanel → **Advanced → Cron Jobs** → every minute: `curl -s "https://crm.yourdomain.com/cron/run?key=YOUR_CRON_SECRET" > /dev/null`
5. Open the site and sign in with SUPER_ADMIN_EMAIL.
Limits on shared plans: requests time out after 120 s (live updates reconnect automatically), and CPU/RAM/process limits are shared with your other sites. Move to a VPS (Option A) once you have many schools.

### Run locally
```bash
npm install                    # server dependencies (server/public already contains the built web app)
cp .env.example .env           # set DATABASE_URL to a local Postgres; set the other values
set -a; . ./.env; set +a
npm start                      # http://localhost:8080
npm run seed:demo              # optional: sample institution → demo@k3solutions.in / Demo@12345
```

---

## Onboarding a new institution (your sales process)

1. **Platform → Institutions → New institution**: name, city, admin email + temporary password and a **free-trial length** (default 14 days). Default nurture sequences are created, paused. **Create demo school** makes a fully-populated institution for sales demos.
   (CLI alternative: `npm run create:institution -- "School" admin@school.in "Temp@1234" Growth Kolkata`)
2. The institution admin signs in and goes to **Settings → WhatsApp**:
   - **Connect with Facebook** (one-click Embedded Signup — available once you are a Meta Tech Provider and have set `META_APP_ID`, `META_APP_SECRET`, `META_ES_CONFIG_ID`), **or**
   - **Manual setup**: Phone number ID, WABA ID, permanent System User access token (`whatsapp_business_messaging`, `whatsapp_business_management`), App secret and App ID. The connection is tested on save.
3. Manual setup only — Meta app → WhatsApp → Configuration → **Webhook**: paste the **Callback URL** and **Verify token** shown in Settings, then subscribe to `messages` and `message_template_status_update`.
4. **Templates → Sync from Meta**, or **Submit starter set** (6 admissions templates; Meta usually approves within minutes to 24 hours).
5. **Settings → Lead sources**: website embed snippet, Meta Lead Ads (Page ID + Page token, and subscribe the Page to `leadgen` using the same callback URL), Google Ads webhook URL + key.
6. **Settings → Messaging**: choose the welcome template, deadline text, application link and monthly ad spend. **Team**: add counsellors.
7. **Nurture**: switch on the sequences they want.

Each institution uses **its own** Meta app/number, and its webhook URL contains its private key (`/webhooks/whatsapp/<key>`). If you later become a Meta Tech Provider and onboard every school under one app, set `META_APP_SECRET` / `META_VERIFY_TOKEN` and use the global `/webhooks/whatsapp`. Messages are routed by phone number ID.

### Getting paid (Razorpay)
1. Razorpay Dashboard → **API keys** → set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Razorpay Dashboard → **Webhooks** → URL `https://<your-domain>/webhooks/razorpay`, events `subscription.activated`, `subscription.charged`, `subscription.pending`, `subscription.halted`, `subscription.cancelled`, `subscription.completed`, `payment.captured`, `order.paid`; put the secret in `RAZORPAY_WEBHOOK_SECRET`. Subscriptions must be enabled on your Razorpay account.
3. **Platform → Company & keys**: your legal name, address, **GSTIN**, state and invoice prefix (printed on every invoice, numbered per financial year, e.g. `K3/2026-27/0001`). The page also shows whether Razorpay and Embedded Signup are configured.
4. **Platform → Plans**: example plans are created for you (Starter ₹2,999/mo, Growth ₹5,999/mo, Growth yearly ₹59,990, Lifetime licence ₹49,999 — all + 18% GST). Edit prices, limits and features, hide plans or add new ones; price changes apply to new subscribers.
5. Institutions pay in **Settings → Plan & billing**. Successful payments activate the plan instantly; renewals arrive by webhook. If a renewal fails, access continues for `BILLING_GRACE_DAYS` (5) days, then the CRM is locked — only the billing screen stays open, and all data is kept. **Platform → Payments** lists every payment and invoice.

You can still manage an institution by hand (**Edit plan & limits**: plan label, access-until date, seats, contacts) or **Suspend** it.

### Backups
Nightly at `BACKUP_HOUR_UTC` (default 21:00 UTC = 02:30 IST) the server writes a compressed snapshot of the whole database (including uploaded files) and keeps `BACKUP_KEEP_DAYS` (14) days. Set `BACKUP_S3_BUCKET` (or use `STORAGE_DRIVER=s3`) to store them in S3 / Cloudflare R2 — strongly recommended on shared hosting — otherwise they go to `BACKUP_DIR`. **Platform → Backups** shows the last run, lets you **Back up now** and download any snapshot.

Restore into an **empty** database: `DATABASE_URL=… node server/scripts/restore-backup.js <file.jsonl.gz | s3:backups/name.jsonl.gz> --yes`

---

## Reliability & scaling
- **WhatsApp media expiry:** Meta media IDs expire after 30 days. Files are re-uploaded automatically after 25 days (`WA_MEDIA_TTL_DAYS`), and if Meta still rejects a media ID, the file is uploaded again and the message resent once.
- **Retries:** temporary errors (rate limit 130429, Meta 5xx / 131000 / 131016, network failures) are retried with exponential back-off (30 s, 1 m, 2 m… capped at 30 min, `RETRY_MAX_ATTEMPTS`=6). Hitting a rate limit pauses that institution's broadcast briefly. Permanent errors (invalid number, template issues) fail immediately. Failed messages are listed on each broadcast under **"N failed — view"**, with a **Retry failed** button. Sequence steps retry the same way.
- **Template variables:** **Templates → Variables** maps each `{{n}}` to a lead field (parent/student name, program, counsellor…), a **custom field** (roll no, fee balance, exam date…) or fixed text. Custom fields are edited on the lead, and filled automatically from extra CSV columns and extra website-form fields.
- **Several app servers:** set `EVENTS_BACKPLANE=postgres` so live inbox updates reach users on every server (PostgreSQL LISTEN/NOTIFY; needs a direct, non-transaction-pooled DB connection). Background sending is already safe on many servers.
- **Object storage:** `STORAGE_DRIVER=s3` with `S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY` stores files in AWS S3, Cloudflare R2, MinIO or DigitalOcean Spaces (the bucket can stay private; files are served through `/uploads`). The default `db` driver keeps a disk cache plus a copy in PostgreSQL.
- `GET /health` shows the active storage driver and realtime mode.

## Security
**Isolation between schools**
- Every query is scoped by `tenant_id`. A token carries the school it belongs to, the role is re-read from the database on every request, and ids that arrive from the browser (counsellor, task owner…) are checked to belong to the same school.
- Each school's webhook URL can only ever deliver into that school (phone-number / page pinning), and webhooks with no App Secret configured are refused (fail closed).
- Uploaded files are limited to the types WhatsApp supports, stored under a server-chosen name/extension and served with a fixed content-type, `nosniff` and a sandbox CSP — an uploaded file can never run script on your domain.

**Sign-in and sessions**
- bcrypt (cost 12, old hashes upgraded silently); password policy (10+ characters, letters + numbers, not common, not your e-mail name).
- Lock-outs: 10 wrong passwords per e-mail / 40 per IP in 15 minutes; unknown e-mails look the same as wrong passwords.
- Sessions are revocable: changing a password, deactivating a user or changing a role signs them out immediately; *Settings → Security → Sign out of all devices*.
- Optional **two-factor authentication** (any authenticator app) with one-time recovery codes; secrets are encrypted at rest and a code can't be replayed.
- Tokens are HS256-pinned; `?token=` is accepted only for the live-update stream.
- In production the server refuses to start with missing / default `JWT_SECRET` or `ENCRYPTION_KEY`.

**K3 support access ("master key")**
- A platform admin can open a school as its admin for up to 2 hours, with a stated reason and an optional **read-only** mode.
- Every session start and every change made in it is written to the audit log the school can read (*Settings → Security → Activity log*). Schools can switch support access off completely. Support sessions cannot change passwords or 2FA.
- Platform admins should turn on 2FA (*Platform → My security*).

**Other**
- Rate limits on login, API (per user), webhooks and AI calls; HSTS, Permissions-Policy, CSP without inline scripts, `object-src 'none'`.
- Passwords are hashed with bcrypt. Sessions are signed JWTs, and login attempts are throttled.
- WhatsApp and Meta tokens and app secrets are encrypted at rest with **AES-256-GCM** (`ENCRYPTION_KEY`) and never returned to the browser.
- Every query is scoped to the signed-in user's institution. Counsellors are restricted to their own leads (configurable).
- Meta webhooks are verified with `X-Hub-Signature-256` (per-institution app secret). Google Ads webhooks are verified with `google_key`. The website form has a honeypot field.
- Strict security headers (CSP, nosniff, frame-ancestors).
- Razorpay payments are verified with HMAC signatures (checkout) and `X-Razorpay-Signature` (webhooks); amounts come from your plans on the server, never from the browser.
- Built-in nightly backups (above); your database provider's own backups are a good second layer.

## Operations
- **Health:** `GET /health`
- **Worker:** runs inside the server (`WORKER_ENABLED=true`). For multiple app instances it is safe to leave it on everywhere: work is claimed with `FOR UPDATE SKIP LOCKED`.
- **Throughput:** `SEND_RATE_PER_TICK` × (1000 / `WORKER_INTERVAL_MS`) messages per second (default 40 per 5 s). Raise it as your Meta messaging tier grows.
- **Webhook log:** failed or unmatched webhooks are stored in the `webhook_log` table for debugging.

## Testing
```bash
# terminal 1: fake Meta + fake Razorpay        terminal 2: server pointed at them
npm run fake-meta & node tests/fake-razorpay.js &
GRAPH_API_BASE=http://localhost:9099 RAZORPAY_API_BASE=http://localhost:9098/v1 RAZORPAY_KEY_ID=rzp_test_K3 RAZORPAY_KEY_SECRET=rzp_secret_K3 \
RAZORPAY_WEBHOOK_SECRET=whsec_K3 META_APP_ID=APP_K3 META_APP_SECRET=meta_secret_K3 META_ES_CONFIG_ID=CFG_K3 \
SUPER_ADMIN_EMAIL=owner@k3solutions.in SUPER_ADMIN_PASSWORD=Owner@12345 npm start
npm run seed:demo && npm run test:api   # end-to-end API checks
npm run test:commercial                 # Razorpay billing + lock-out + invoices, Embedded Signup, backup & restore
npm run test:ui                         # Playwright: every screen, realtime inbox, broadcast, kanban, Razorpay checkout, platform console
npm run test:responsive                 # every screen at 360–1920 px — fails on sideways overflow (BASE=… for the live server)
npm run test:reliability                # media expiry, retries, variables, multi-server realtime, S3 (see file header)
npm run test:security                   # tenant isolation, forged tokens, sessions, 2FA, support access, webhook pinning, uploads
npm run test:security-ui                # Playwright: 2FA sign-in, Security tab, activity log
npm run test:ai                         # open-source AI engines (fake Ollama / Hugging Face), caching, masking, fallback
```

## API
All endpoints are under `/api/v1` (Bearer token). The full list is in `web/src/app/core/api.service.ts` and on the **API & Integrations** page of the demo. Lead webhooks: `POST /hooks/leads/:key`, `POST /hooks/google-ads/:key`. Meta: `GET|POST /webhooks/whatsapp/:key`. Razorpay: `POST /webhooks/razorpay`.

© K3 Solutions · Kontent Konnect Kommunicate
