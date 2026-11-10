-- Security hardening: session revocation, audit trail, support-access consent, optional 2FA

-- Bumping token_version signs the user out of every device (password change, role change, deactivation, "sign out everywhere")
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version int NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret_enc text;          -- AES-GCM encrypted TOTP secret (null = 2FA off)
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_recovery jsonb NOT NULL DEFAULT '[]'::jsonb;   -- sha256 hashes of unused recovery codes
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_last_step bigint NOT NULL DEFAULT 0;          -- replay protection

-- Each institution decides whether K3 support may open a support session for it (default: yes, as per the service agreement)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS support_access boolean NOT NULL DEFAULT true;

-- Who did what. Support sessions (K3 staff acting inside a school) are always recorded here and visible to that school's admins.
CREATE TABLE IF NOT EXISTS audit_log (
  id            bigserial PRIMARY KEY,
  at            timestamptz NOT NULL DEFAULT now(),
  tenant_id     uuid,                       -- institution affected (null = platform-level event)
  actor_id      uuid,
  actor_email   text,
  actor_role    text,
  support       boolean NOT NULL DEFAULT false,   -- true when a K3 platform admin was acting inside an institution
  action        text NOT NULL,              -- e.g. login.success, support.start, team.password_reset
  target        text,
  detail        jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip            text,
  ua            text
);
CREATE INDEX IF NOT EXISTS audit_tenant_idx ON audit_log(tenant_id, at DESC);
CREATE INDEX IF NOT EXISTS audit_at_idx ON audit_log(at DESC);
CREATE INDEX IF NOT EXISTS audit_actor_idx ON audit_log(actor_id, at DESC);

CREATE INDEX IF NOT EXISTS webhook_log_created_idx ON webhook_log(created_at);
