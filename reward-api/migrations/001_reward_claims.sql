BEGIN;
CREATE TABLE IF NOT EXISTS reward_claims (
 id UUID PRIMARY KEY,
 license_id TEXT NOT NULL UNIQUE,
 completion_id TEXT NOT NULL,
 idempotency_key TEXT NOT NULL UNIQUE,
 verification_code TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 email TEXT NOT NULL,
 license_type TEXT NOT NULL,
 founder_number SMALLINT,
 license_label TEXT NOT NULL,
 completed_at TIMESTAMPTZ NOT NULL,
 claimed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 reward_type TEXT NOT NULL CHECK (reward_type IN ('digital','physical')),
 reward_edit_count SMALLINT NOT NULL DEFAULT 0 CHECK (reward_edit_count BETWEEN 0 AND 1),
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PREPARING','SHIPPED','DELIVERED','CANCELLED')),
 full_name TEXT,address TEXT,address_number TEXT,address_complement TEXT,postal_code TEXT,city TEXT,state TEXT,country TEXT,phone TEXT,
 physical_consent BOOLEAN NOT NULL DEFAULT FALSE,
 shipping_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (shipping_status IN ('PENDING','PREPARING','SHIPPED','DELIVERED','CANCELLED')),
 tracking_code TEXT,carrier TEXT,shipped_at TIMESTAMPTZ,delivered_at TIMESTAMPTZ,admin_notes TEXT,
 notification_status TEXT NOT NULL DEFAULT 'NOT_REQUIRED' CHECK(notification_status IN ('NOT_REQUIRED','PENDING','SENT','FAILED')),
 notification_attempted_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reward_claims_status_idx ON reward_claims(status);
CREATE INDEX IF NOT EXISTS reward_claims_claimed_at_idx ON reward_claims(claimed_at DESC);
CREATE TABLE IF NOT EXISTS admin_sessions(
 id_hash TEXT PRIMARY KEY,username TEXT NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions(expires_at);
CREATE TABLE IF NOT EXISTS schema_migrations(version TEXT PRIMARY KEY,applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
INSERT INTO schema_migrations(version) VALUES('001_reward_claims') ON CONFLICT DO NOTHING;
COMMIT;
