-- K3 Solutions WhatsApp Admissions CRM — initial schema (PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  text NOT NULL,
  type                  text NOT NULL DEFAULT 'School',
  city                  text NOT NULL DEFAULT '',
  session               text NOT NULL DEFAULT '',
  plan                  text NOT NULL DEFAULT 'Starter',
  status                text NOT NULL DEFAULT 'active',          -- active | suspended
  max_users             int  NOT NULL DEFAULT 5,
  max_contacts          int  NOT NULL DEFAULT 5000,
  plan_expires_at       timestamptz,
  webhook_key           text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  settings              jsonb NOT NULL DEFAULT '{}'::jsonb,       -- programs, spend, template vars, defaults
  ai_config             jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- WhatsApp Cloud API
  wa_phone_number_id    text UNIQUE,
  wa_waba_id            text,
  wa_display_number     text NOT NULL DEFAULT '',
  wa_access_token_enc   text,
  wa_app_secret_enc     text,
  wa_verify_token       text NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  meta_app_id           text,
  -- Lead sources
  meta_page_id          text,
  meta_page_token_enc   text,
  google_lead_key       text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid REFERENCES tenants(id) ON DELETE CASCADE,  -- NULL for platform super admins
  name           text NOT NULL,
  email          text NOT NULL UNIQUE,
  password_hash  text NOT NULL,
  role           text NOT NULL CHECK (role IN ('super_admin','admin','counsellor')),
  phone          text NOT NULL DEFAULT '',
  color          text NOT NULL DEFAULT '#1a73e8',
  active         boolean NOT NULL DEFAULT true,
  last_login_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS users_tenant_idx ON users(tenant_id);

CREATE TABLE IF NOT EXISTS leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  student           text NOT NULL DEFAULT '',
  parent            text NOT NULL DEFAULT '',
  phone             text NOT NULL,              -- display, e.g. +91 98300 12345
  wa_id             text NOT NULL,              -- digits only, E.164 without +
  email             text NOT NULL DEFAULT '',
  program           text NOT NULL DEFAULT '',
  source            text NOT NULL DEFAULT 'Website Form',
  campaign          text NOT NULL DEFAULT '',
  area              text NOT NULL DEFAULT '',
  stage             text NOT NULL DEFAULT 'new',
  counsellor_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  tags              text[] NOT NULL DEFAULT '{}',
  unread            int NOT NULL DEFAULT 0,
  opted_out         boolean NOT NULL DEFAULT false,
  reply_count       int NOT NULL DEFAULT 0,
  avg_reply_mins    numeric NOT NULL DEFAULT 0,
  last_outbound_at  timestamptz,
  last_inbound_at   timestamptz,
  last_activity_at  timestamptz NOT NULL DEFAULT now(),
  next_follow_up    timestamptz,
  ai                jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_score          int NOT NULL DEFAULT 0,
  ai_temp           text NOT NULL DEFAULT 'cold',
  external_id       text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, wa_id)
);
CREATE INDEX IF NOT EXISTS leads_tenant_created_idx ON leads(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS leads_tenant_temp_idx ON leads(tenant_id, ai_temp);
CREATE INDEX IF NOT EXISTS leads_tenant_stage_idx ON leads(tenant_id, stage);

CREATE TABLE IF NOT EXISTS messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id        uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender         text NOT NULL,                 -- lead | agent | bot | sequence | broadcast
  type           text NOT NULL DEFAULT 'text',  -- text | template | media | button | interactive
  text           text NOT NULL DEFAULT '',
  template       text,
  media          jsonb,
  wa_message_id  text UNIQUE,
  context_id     text,
  status         text NOT NULL DEFAULT 'queued', -- queued | sent | delivered | read | failed | received
  error          text,
  user_id        uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_lead_idx ON messages(lead_id, created_at);

CREATE TABLE IF NOT EXISTS notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id    uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  text       text NOT NULL,
  user_id    uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timeline (
  id         bigserial PRIMARY KEY,
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id    uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  icon       text NOT NULL DEFAULT 'info',
  text       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS timeline_lead_idx ON timeline(lead_id, created_at);

CREATE TABLE IF NOT EXISTS followups (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id    uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'call',
  due_at     timestamptz NOT NULL,
  note       text NOT NULL DEFAULT '',
  done       boolean NOT NULL DEFAULT false,
  done_at    timestamptz,
  owner_id   uuid REFERENCES users(id) ON DELETE SET NULL,
  auto       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS followups_tenant_idx ON followups(tenant_id, done, due_at);

CREATE TABLE IF NOT EXISTS templates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name           text NOT NULL,
  language       text NOT NULL DEFAULT 'en',
  category       text NOT NULL DEFAULT 'Marketing',
  status         text NOT NULL DEFAULT 'Pending',  -- Approved | Pending | Rejected | Paused | Disabled
  header         text NOT NULL DEFAULT 'none',     -- none | image | video | document
  body           text NOT NULL DEFAULT '',
  buttons        jsonb NOT NULL DEFAULT '[]'::jsonb,
  reject_reason  text,
  meta_id        text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name, language)
);

CREATE TABLE IF NOT EXISTS sequences (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name       text NOT NULL,
  trigger    text NOT NULL,                 -- lead_created | temp:hot | temp:warm | temp:cold | stage:<id> | source:<name> | manual
  active     boolean NOT NULL DEFAULT false,
  color      text NOT NULL DEFAULT '#1a73e8',
  steps      jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sequence_id  uuid NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
  lead_id      uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  step         int NOT NULL DEFAULT 0,
  next_run_at  timestamptz NOT NULL DEFAULT now(),
  status       text NOT NULL DEFAULT 'active',  -- active | completed | stopped
  replied      boolean NOT NULL DEFAULT false,
  started_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sequence_id, lead_id)
);
CREATE INDEX IF NOT EXISTS enrollments_due_idx ON enrollments(status, next_run_at);

CREATE TABLE IF NOT EXISTS media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  wa_media_id  text,
  name         text NOT NULL DEFAULT '',
  mime         text NOT NULL DEFAULT '',
  type         text NOT NULL DEFAULT 'document',
  size         int NOT NULL DEFAULT 0,
  path         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            text NOT NULL,
  template        text NOT NULL,
  segment         jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience_label  text NOT NULL DEFAULT '',
  creative        jsonb,
  status          text NOT NULL DEFAULT 'Draft',  -- Draft | Scheduled | Sending | Completed | Failed
  scheduled_at    timestamptz,
  sent_at         timestamptz,
  audience        int NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS broadcast_recipients (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id   uuid NOT NULL REFERENCES broadcasts(id) ON DELETE CASCADE,
  tenant_id      uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  lead_id        uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  wa_message_id  text,
  status         text NOT NULL DEFAULT 'queued',  -- queued | sending | sent | delivered | read | failed
  error          text,
  replied        boolean NOT NULL DEFAULT false,
  clicked        boolean NOT NULL DEFAULT false,
  sent_at        timestamptz,
  UNIQUE (broadcast_id, lead_id)
);
CREATE INDEX IF NOT EXISTS bcr_queue_idx ON broadcast_recipients(status, broadcast_id);
CREATE INDEX IF NOT EXISTS bcr_wamid_idx ON broadcast_recipients(wa_message_id);

CREATE TABLE IF NOT EXISTS webhook_log (
  id          bigserial PRIMARY KEY,
  tenant_id   uuid,
  kind        text NOT NULL,
  payload     jsonb NOT NULL,
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
