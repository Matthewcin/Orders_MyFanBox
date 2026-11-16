-- MyFanBox v2 - NeonDB / PostgreSQL
-- El servidor ejecuta este esquema automáticamente al iniciar.

CREATE TABLE IF NOT EXISTS mfb_catalog (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price INTEGER NOT NULL DEFAULT 0,
  unit_cost INTEGER NOT NULL DEFAULT 0,
  blank_name TEXT,
  sizes JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfb_orders (
  id TEXT PRIMARY KEY,
  uuid TEXT,
  customer_name TEXT NOT NULL,
  instagram TEXT,
  phone TEXT,
  city TEXT,
  neighborhood TEXT,
  address TEXT,
  postal_code TEXT,
  formatted_address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address_verified BOOLEAN NOT NULL DEFAULT FALSE,
  carrier TEXT,
  tracking_number TEXT,
  payment_status TEXT NOT NULL,
  shipping_status TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS uuid TEXT;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS formatted_address TEXT;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;
ALTER TABLE mfb_orders ADD COLUMN IF NOT EXISTS address_verified BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS mfb_inventory_progress (
  item_key TEXT PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('BOUGHT_SUPPLY', 'MADE_PRODUCT')),
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfb_admin_config (
  config_key TEXT PRIMARY KEY,
  admin_username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  hide_default_hint BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mfb_app_settings (
  config_key TEXT PRIMARY KEY,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfb_orders_payment ON mfb_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_mfb_orders_shipping ON mfb_orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_mfb_orders_uuid ON mfb_orders(uuid);
