-- Razorpay billing: plans, subscriptions, one-time licences, payments & invoices
CREATE TABLE IF NOT EXISTS plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code              text NOT NULL UNIQUE,
  name              text NOT NULL,
  description       text NOT NULL DEFAULT '',
  billing           text NOT NULL DEFAULT 'monthly' CHECK (billing IN ('monthly', 'yearly', 'one_time')),
  price_paise       int  NOT NULL,                 -- price before GST, in paise
  gst_percent       numeric NOT NULL DEFAULT 18,
  currency          text NOT NULL DEFAULT 'INR',
  max_users         int  NOT NULL DEFAULT 5,
  max_contacts      int  NOT NULL DEFAULT 5000,
  features          jsonb NOT NULL DEFAULT '[]'::jsonb,
  razorpay_plan_id  text,
  active            boolean NOT NULL DEFAULT true,
  sort              int NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_status text NOT NULL DEFAULT 'manual'; -- manual | trial | active | past_due | cancelled | lifetime
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES plans(id) ON DELETE SET NULL;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS rzp_subscription_id text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS current_period_end timestamptz;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_gstin text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_address text;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS wa_pin_enc text;

CREATE TABLE IF NOT EXISTS payments (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id              uuid REFERENCES plans(id) ON DELETE SET NULL,
  kind                 text NOT NULL,                -- subscription | one_time
  status               text NOT NULL DEFAULT 'captured',
  rzp_payment_id       text UNIQUE,
  rzp_order_id         text,
  rzp_subscription_id  text,
  amount_paise         int NOT NULL,                 -- total charged (incl. GST)
  tax_paise            int NOT NULL DEFAULT 0,
  currency             text NOT NULL DEFAULT 'INR',
  invoice_no           text UNIQUE,
  period_start         timestamptz,
  period_end           timestamptz,
  description          text NOT NULL DEFAULT '',
  created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payments_tenant_idx ON payments(tenant_id, created_at DESC);

CREATE TABLE IF NOT EXISTS platform_settings (
  key    text PRIMARY KEY,
  value  jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS counters (
  key    text PRIMARY KEY,
  value  bigint NOT NULL DEFAULT 0
);

-- Example plans (edit prices in Institutions → Plans; they sync to Razorpay on first purchase)
INSERT INTO plans (code, name, description, billing, price_paise, max_users, max_contacts, features, sort) VALUES
  ('starter-monthly', 'Starter', 'For pre-schools and small institutes', 'monthly', 299900, 3, 2000, '["WhatsApp inbox & templates","AI lead qualification","Lead capture: website, Meta, Google","Basic reports"]', 1),
  ('growth-monthly', 'Growth', 'For schools running admissions campaigns', 'monthly', 599900, 8, 10000, '["Everything in Starter","Broadcasts with creatives","Nurture sequences","Counsellor performance reports"]', 2),
  ('growth-yearly', 'Growth (yearly)', 'Growth plan billed yearly — 2 months free', 'yearly', 5999000, 8, 10000, '["Everything in Growth","2 months free"]', 3),
  ('licence-one-time', 'Lifetime licence', 'One-time payment, no monthly fee', 'one_time', 4999900, 10, 20000, '["Everything in Growth","Pay once"]', 4)
ON CONFLICT (code) DO NOTHING;
