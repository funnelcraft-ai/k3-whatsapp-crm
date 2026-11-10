-- B: WhatsApp media IDs expire after 30 days → remember when each was uploaded
ALTER TABLE media ADD COLUMN IF NOT EXISTS wa_uploaded_at timestamptz;
UPDATE media SET wa_uploaded_at = created_at WHERE wa_media_id IS NOT NULL AND wa_uploaded_at IS NULL;
-- E: where the file lives (db = disk cache + database copy, s3 = object storage key in path)
ALTER TABLE media ADD COLUMN IF NOT EXISTS storage text NOT NULL DEFAULT 'db';

-- C: per-template variable mapping + per-lead custom fields
ALTER TABLE templates ADD COLUMN IF NOT EXISTS var_map jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom jsonb NOT NULL DEFAULT '{}'::jsonb;

-- D: retries with exponential backoff (broadcasts + sequences)
ALTER TABLE broadcast_recipients ADD COLUMN IF NOT EXISTS attempts int NOT NULL DEFAULT 0;
ALTER TABLE broadcast_recipients ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz;
CREATE INDEX IF NOT EXISTS bcr_due_idx ON broadcast_recipients (status, next_attempt_at);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS attempts int NOT NULL DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_error text;

-- A: realtime backplane outbox for events too large for NOTIFY (8 KB limit)
CREATE TABLE IF NOT EXISTS event_outbox (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
