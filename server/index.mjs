import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { consultarGuiaInterrapidisimo } from './interrapidisimo.mjs';

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 3001);
const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.MFB_SESSION_SECRET;
const INITIAL_ADMIN_USER = (process.env.MFB_ADMIN_USERNAME || 'admin').trim();
const INITIAL_ADMIN_PASSWORD = process.env.MFB_ADMIN_PASSWORD;
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const REMEMBERED_SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;
const ALLOWED_ORIGINS = new Set((process.env.MFB_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean));
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (!DATABASE_URL) throw new Error('Falta DATABASE_URL. Configura la URL PostgreSQL de Neon en las variables de entorno del servidor.');
if (!SESSION_SECRET || SESSION_SECRET.length < 32) throw new Error('MFB_SESSION_SECRET debe contener al menos 32 caracteres aleatorios.');
if (!INITIAL_ADMIN_PASSWORD || INITIAL_ADMIN_PASSWORD.length < 10) throw new Error('MFB_ADMIN_PASSWORD debe contener al menos 10 caracteres y configurarse en el servidor.');
if (!INITIAL_ADMIN_USER) throw new Error('MFB_ADMIN_USERNAME no puede estar vacío.');

const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 12_000,
  ssl: /localhost|127\.0\.0\.1/.test(DATABASE_URL) ? false : { rejectUnauthorized: true }
});

app.disable('x-powered-by');
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    if (!ALLOWED_ORIGINS.has(origin)) {
      return res.status(403).json({ error: 'Origen no autorizado. Revisa MFB_ALLOWED_ORIGINS en el servidor.' });
    }
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    res.setHeader('Access-Control-Max-Age', '86400');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(origin && !ALLOWED_ORIGINS.has(origin) ? 403 : 204);
  next();
});
app.use(express.json({ limit: '8mb' }));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

const SCHEMA_SQL = `
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

CREATE TABLE IF NOT EXISTS mfb_other_workspace (
  workspace_key TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{"products":[],"orders":[]}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mfb_orders_payment ON mfb_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_mfb_orders_shipping ON mfb_orders(shipping_status);
CREATE INDEX IF NOT EXISTS idx_mfb_orders_uuid ON mfb_orders(uuid);
`;

function asJson(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return { valid: false, legacy: false };
  if (storedHash.startsWith('scrypt$')) {
    const [, saltHex, hashHex] = storedHash.split('$');
    if (!saltHex || !hashHex || !/^[0-9a-f]+$/i.test(saltHex) || !/^[0-9a-f]+$/i.test(hashHex)) {
      return { valid: false, legacy: false };
    }
    const expected = Buffer.from(hashHex, 'hex');
    const actual = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
    return { valid: expected.length === actual.length && crypto.timingSafeEqual(expected, actual), legacy: false };
  }
  // Compatibility with the previous browser version, which stored SHA-256 hex hashes.
  if (/^[0-9a-f]{64}$/i.test(storedHash)) {
    const actual = crypto.createHash('sha256').update(password).digest('hex');
    const a = Buffer.from(actual, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    return { valid: a.length === b.length && crypto.timingSafeEqual(a, b), legacy: true };
  }
  return { valid: false, legacy: false };
}

function signSession(username, authVersion, remember = false) {
  const ttl = remember ? REMEMBERED_SESSION_TTL_SECONDS : SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ sub: username, v: authVersion, exp: Math.floor(Date.now() / 1000) + ttl })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token) {
  if (typeof token !== 'string' || token.length > 4096) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return null; }
  if (received.length !== expected.length || !crypto.timingSafeEqual(expected, received)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.sub || !Number.isInteger(decoded.v) || !Number.isInteger(decoded.exp) || decoded.exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch { return null; }
}

async function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = verifySession(token);
  if (!session) return res.status(401).json({ error: 'Sesión inválida o vencida. Inicia sesión nuevamente.' });
  try {
    const result = await pool.query(
      "SELECT admin_username, updated_at FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1"
    );
    const admin = result.rows[0];
    const currentVersion = admin?.updated_at ? new Date(admin.updated_at).getTime() : 0;
    if (!admin || admin.admin_username !== session.sub || currentVersion !== session.v) {
      return res.status(401).json({ error: 'Las credenciales administrativas cambiaron. Inicia sesión nuevamente.' });
    }
    req.admin = session;
    next();
  } catch (error) {
    console.error('No se pudo validar la sesión administrativa:', error);
    res.status(503).json({ error: 'No se pudo validar la sesión con NeonDB.' });
  }
}

const loginAttempts = new Map();
function loginRateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60_000 };
  if (record.resetAt <= now) { record.count = 0; record.resetAt = now + 15 * 60_000; }
  if (record.count >= 8) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos antes de volver a intentar.' });
  record.count += 1;
  loginAttempts.set(ip, record);
  next();
}

async function initializeDatabase() {
  await pool.query(SCHEMA_SQL);

  await pool.query(
    `INSERT INTO mfb_other_workspace (workspace_key, payload)
     VALUES ('default', '{"products":[],"orders":[]}'::jsonb)
     ON CONFLICT (workspace_key) DO NOTHING`
  );

  const existing = await pool.query("SELECT config_key FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1");
  if (existing.rowCount === 0) {
    await pool.query(
      `INSERT INTO mfb_admin_config (config_key, admin_username, password_hash, hide_default_hint)
       VALUES ('PRIMARY_ADMIN', $1, $2, TRUE)
       ON CONFLICT (config_key) DO NOTHING`,
      [INITIAL_ADMIN_USER, hashPassword(INITIAL_ADMIN_PASSWORD)]
    );
    console.log('Administrador inicial creado en NeonDB usando variables de entorno.');
  }

  const catalogCount = await pool.query('SELECT COUNT(*)::int AS count FROM mfb_catalog');
  if (Number(catalogCount.rows[0]?.count || 0) === 0) {
    const starterCatalog = JSON.parse(fs.readFileSync(new URL('./initial-catalog.json', import.meta.url), 'utf8'));
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const product of starterCatalog) {
        await client.query(
          `INSERT INTO mfb_catalog (id, code, name, category, base_price, unit_cost, blank_name, sizes, variants)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb)
           ON CONFLICT (id) DO NOTHING`,
          [product.id, product.code, product.name, product.category, product.basePrice, product.unitCost,
           product.blankName || '', JSON.stringify(product.sizes || []), JSON.stringify(product.variants || [])]
        );
      }
      await client.query('COMMIT');
      console.log(`Catálogo inicial (${starterCatalog.length} productos) insertado en NeonDB. No se generaron pedidos de demostración.`);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }
  console.log('Esquema de MyFanBox (incluido espacio aislado mfb_other_workspace) verificado en PostgreSQL.');
}

function mapCatalog(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category,
    basePrice: Number(row.base_price) || 0,
    unitCost: Number(row.unit_cost) || 0,
    blankName: row.blank_name || '',
    sizes: asJson(row.sizes, []),
    variants: asJson(row.variants, [])
  };
}

function mapOrder(row) {
  return {
    id: row.id,
    uuid: row.uuid,
    customerName: row.customer_name,
    instagram: row.instagram || '',
    phone: row.phone || '',
    city: row.city || '',
    neighborhood: row.neighborhood || '',
    address: row.address || '',
    postalCode: row.postal_code || '',
    formattedAddress: row.formatted_address || '',
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    addressVerified: Boolean(row.address_verified),
    carrier: row.carrier || '',
    trackingNumber: row.tracking_number || '',
    paymentStatus: row.payment_status,
    shippingStatus: row.shipping_status,
    items: asJson(row.items, []),
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    notes: row.notes || '',
    createdAt: row.created_at || ''
  };
}

async function getAdminConfig() {
  const { rows } = await pool.query(
    "SELECT admin_username, hide_default_hint FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1"
  );
  if (!rows[0]) return { username: INITIAL_ADMIN_USER, hideDefaultHint: true };
  return { username: rows[0].admin_username, hideDefaultHint: Boolean(rows[0].hide_default_hint) };
}

app.get('/api/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT 1 AS connected');
    res.json({ ok: true, database: 'connected', result: Number(result.rows[0].connected) });
  } catch (error) {
    console.error('Health check de NeonDB falló:', error.message);
    res.status(503).json({ ok: false, database: 'error', error: 'La API está activa, pero no pudo consultar NeonDB.' });
  }
});

app.post('/api/admin/login', loginRateLimit, async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = String(req.body?.password || '');
    if (!username || !password || password.length > 1024) return res.status(400).json({ error: 'Completa usuario y contraseña.' });
    const result = await pool.query(
      "SELECT admin_username, password_hash, hide_default_hint, updated_at FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1"
    );
    const admin = result.rows[0];
    const usernameMatches = admin && admin.admin_username === username;
    const verification = admin ? verifyPassword(password, admin.password_hash) : { valid: false, legacy: false };
    if (!usernameMatches || !verification.valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    loginAttempts.delete(req.ip || req.socket.remoteAddress || 'unknown');
    if (verification.legacy) {
      await pool.query(
        "UPDATE mfb_admin_config SET password_hash = $1, updated_at = NOW() WHERE config_key = 'PRIMARY_ADMIN'",
        [hashPassword(password)]
      );
    }
    const currentAdmin = await pool.query(
      "SELECT admin_username, hide_default_hint, updated_at FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1"
    );
    const current = currentAdmin.rows[0];
    const token = signSession(current.admin_username, new Date(current.updated_at).getTime(), Boolean(req.body?.remember));
    res.json({ token, adminConfig: { username: current.admin_username, hideDefaultHint: Boolean(current.hide_default_hint) } });
  } catch (error) {
    console.error('Login falló:', error);
    res.status(500).json({ error: 'No se pudo validar el inicio de sesión.' });
  }
});

app.get('/api/admin/bootstrap', requireAdmin, async (_req, res) => {
  try {
    const [catalogResult, orderResult, inventoryResult, settingsResult, adminConfig] = await Promise.all([
      pool.query('SELECT * FROM mfb_catalog ORDER BY id ASC'),
      pool.query('SELECT * FROM mfb_orders ORDER BY created_at DESC NULLS LAST, id DESC'),
      pool.query('SELECT item_key, kind, quantity FROM mfb_inventory_progress'),
      pool.query("SELECT config_value FROM mfb_app_settings WHERE config_key = 'PRIMARY_SETTINGS' LIMIT 1"),
      getAdminConfig()
    ]);
    const boughtSupplies = {};
    const madeItems = {};
    for (const row of inventoryResult.rows) {
      if (row.kind === 'BOUGHT_SUPPLY') boughtSupplies[row.item_key] = Number(row.quantity) || 0;
      if (row.kind === 'MADE_PRODUCT') madeItems[row.item_key] = Number(row.quantity) || 0;
    }
    const settings = asJson(settingsResult.rows[0]?.config_value, {});
    res.json({
      catalog: catalogResult.rows.map(mapCatalog),
      orders: orderResult.rows.map(mapOrder),
      boughtSupplies,
      madeItems,
      settings,
      adminConfig
    });
  } catch (error) {
    console.error('Bootstrap de datos falló:', error);
    res.status(500).json({ error: 'No se pudieron cargar los datos de NeonDB.' });
  }
});

app.put('/api/admin/data', requireAdmin, async (req, res) => {
  const catalog = req.body?.catalog;
  const orders = req.body?.orders;
  const boughtSupplies = req.body?.boughtSupplies || {};
  const madeItems = req.body?.madeItems || {};
  const settings = req.body?.settings || {};

  if (!Array.isArray(catalog) || !Array.isArray(orders) || catalog.length > 2000 || orders.length > 100_000) {
    return res.status(400).json({ error: 'Snapshot inválido: catálogo y pedidos deben ser arreglos válidos.' });
  }
  if (!boughtSupplies || typeof boughtSupplies !== 'object' || Array.isArray(boughtSupplies) || !madeItems || typeof madeItems !== 'object' || Array.isArray(madeItems)) {
    return res.status(400).json({ error: 'El inventario enviado no tiene un formato válido.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Serializa snapshots completos para evitar que dos guardados simultáneos se pisen.
    await client.query('SELECT pg_advisory_xact_lock(771234991)');
    await client.query('DELETE FROM mfb_orders');
    await client.query('DELETE FROM mfb_catalog');
    await client.query('DELETE FROM mfb_inventory_progress');

    for (const product of catalog) {
      if (!product?.id || !product?.name) throw new Error('Hay un producto sin ID o nombre.');
      await client.query(
        `INSERT INTO mfb_catalog (id, code, name, category, base_price, unit_cost, blank_name, sizes, variants, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9::jsonb,NOW())`,
        [
          String(product.id), String(product.code || ''), String(product.name), String(product.category || 'Prenda'),
          Math.round(Number(product.basePrice) || 0), Math.round(Number(product.unitCost) || 0),
          String(product.blankName || ''), JSON.stringify(Array.isArray(product.sizes) ? product.sizes : []),
          JSON.stringify(Array.isArray(product.variants) ? product.variants : [])
        ]
      );
    }

    for (const order of orders) {
      if (!order?.id || !order?.customerName || !order?.paymentStatus || !order?.shippingStatus) {
        throw new Error(`El pedido ${order?.id || '(sin ID)'} tiene campos obligatorios incompletos.`);
      }
      if (order.uuid && !UUID_V4.test(String(order.uuid))) throw new Error(`El UUID del pedido ${order.id} no es válido.`);
      await client.query(
        `INSERT INTO mfb_orders (
          id, uuid, customer_name, instagram, phone, city, neighborhood, address, postal_code,
          formatted_address, lat, lng, address_verified, carrier, tracking_number, payment_status,
          shipping_status, items, discount, total, notes, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18::jsonb,$19,$20,$21,$22,NOW())`,
        [
          String(order.id), order.uuid || null, String(order.customerName), String(order.instagram || ''), String(order.phone || ''),
          String(order.city || ''), String(order.neighborhood || ''), String(order.address || ''), String(order.postalCode || ''),
          String(order.formattedAddress || ''), order.lat !== null && order.lat !== undefined && order.lat !== '' && Number.isFinite(Number(order.lat)) ? Number(order.lat) : null,
          order.lng !== null && order.lng !== undefined && order.lng !== '' && Number.isFinite(Number(order.lng)) ? Number(order.lng) : null, Boolean(order.addressVerified), String(order.carrier || ''),
          String(order.trackingNumber || ''), String(order.paymentStatus), String(order.shippingStatus),
          JSON.stringify(Array.isArray(order.items) ? order.items : []), Math.round(Number(order.discount) || 0),
          Math.round(Number(order.total) || 0), String(order.notes || ''), String(order.createdAt || '')
        ]
      );
    }

    for (const [kind, source] of [['BOUGHT_SUPPLY', boughtSupplies], ['MADE_PRODUCT', madeItems]]) {
      for (const [itemKey, rawQuantity] of Object.entries(source)) {
        if (!itemKey) continue;
        const quantity = Math.max(0, Math.round(Number(rawQuantity) || 0));
        await client.query(
          `INSERT INTO mfb_inventory_progress (item_key, kind, quantity, updated_at)
           VALUES ($1,$2,$3,NOW())`,
          [String(itemKey), kind, quantity]
        );
      }
    }

    await client.query(
      `INSERT INTO mfb_app_settings (config_key, config_value, updated_at)
       VALUES ('PRIMARY_SETTINGS', $1::jsonb, NOW())
       ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value, updated_at = NOW()`,
      [JSON.stringify(settings)]
    );
    await client.query('COMMIT');
    res.json({ ok: true, saved: { catalog: catalog.length, orders: orders.length } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Guardado transaccional falló:', error);
    res.status(400).json({ error: `No se guardó el snapshot. La transacción fue revertida: ${error.message}` });
  } finally {
    client.release();
  }
});

app.put('/api/admin/config', requireAdmin, async (req, res) => {
  try {
    const username = String(req.body?.username || '').trim();
    const password = req.body?.password == null ? '' : String(req.body.password);
    const hideDefaultHint = Boolean(req.body?.hideDefaultHint);
    if (!username || username.length > 120) return res.status(400).json({ error: 'El usuario debe tener entre 1 y 120 caracteres.' });
    if (password && password.length < 10) return res.status(400).json({ error: 'La contraseña debe tener al menos 10 caracteres.' });
    if (password.length > 1024) return res.status(400).json({ error: 'La contraseña es demasiado larga.' });

    if (password) {
      await pool.query(
        `UPDATE mfb_admin_config SET admin_username = $1, password_hash = $2, hide_default_hint = $3, updated_at = NOW()
         WHERE config_key = 'PRIMARY_ADMIN'`,
        [username, hashPassword(password), hideDefaultHint]
      );
    } else {
      await pool.query(
        `UPDATE mfb_admin_config SET admin_username = $1, hide_default_hint = $2, updated_at = NOW()
         WHERE config_key = 'PRIMARY_ADMIN'`,
        [username, hideDefaultHint]
      );
    }
    const updated = await pool.query(
      "SELECT updated_at FROM mfb_admin_config WHERE config_key = 'PRIMARY_ADMIN' LIMIT 1"
    );
    const token = signSession(username, new Date(updated.rows[0].updated_at).getTime(), Boolean(req.body?.remember));
    res.json({ ok: true, token, adminConfig: { username, hideDefaultHint } });
  } catch (error) {
    console.error('Actualización de credenciales falló:', error);
    res.status(500).json({ error: 'No se pudieron actualizar las credenciales.' });
  }
});

app.post('/api/admin/init', requireAdmin, async (_req, res) => {
  try {
    await pool.query(SCHEMA_SQL);
    await pool.query(
      `INSERT INTO mfb_other_workspace (workspace_key, payload)
       VALUES ('default', '{"products":[],"orders":[]}'::jsonb)
       ON CONFLICT (workspace_key) DO NOTHING`
    );
    res.json({ ok: true, message: 'Las tablas de MyFanBox (incluido espacio aislado) están listas en NeonDB.' });
  } catch (error) {
    console.error('Error en /api/admin/init:', error);
    res.status(503).json({ error: 'NeonDB no respondió a la inicialización.' });
  }
});

app.post('/api/admin/sql', requireAdmin, async (req, res) => {
  const query = String(req.body?.query || '').trim().replace(/;+\s*$/, '');
  if (!query || query.length > 10_000 || query.includes(';')) return res.status(400).json({ error: 'Escribe una sola consulta SQL de lectura.' });
  if (!/^(SELECT|WITH|SHOW)\b/i.test(query) || /\b(FOR\s+UPDATE|FOR\s+SHARE|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|COPY|CALL|DO)\b/i.test(query)) {
    return res.status(400).json({ error: 'Solo se permiten consultas SELECT, WITH o SHOW.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SET LOCAL statement_timeout = '5s'");
    const result = await client.query(query);
    await client.query('COMMIT');
    res.json({ rows: result.rows, rowCount: result.rowCount, fields: result.fields.map(field => field.name) });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    res.status(400).json({ error: `Consulta no ejecutada: ${error.message}` });
  } finally {
    client.release();
  }
});

app.get('/api/tracking/interrapidisimo', async (req, res) => {
  const guia = String(req.query.guia || '').trim();
  if (!guia) {
    return res.status(400).json({ ok: false, error: 'Falta el parámetro guia.' });
  }
  const result = await consultarGuiaInterrapidisimo(guia);
  return res.json(result);
});

app.get('/api/admin/other-workspace', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT payload, updated_at FROM mfb_other_workspace WHERE workspace_key = 'default' LIMIT 1"
    );
    const payload = asJson(result.rows[0]?.payload, { products: [], orders: [] });
    res.json({
      products: Array.isArray(payload.products) ? payload.products : [],
      orders: Array.isArray(payload.orders) ? payload.orders : [],
      updatedAt: result.rows[0]?.updated_at || null
    });
  } catch (error) {
    console.error('Error al leer mfb_other_workspace:', error);
    res.status(500).json({ error: 'No se pudo cargar el espacio aislado desde NeonDB.' });
  }
});

app.put('/api/admin/other-workspace', requireAdmin, async (req, res) => {
  const products = req.body?.products;
  const orders = req.body?.orders;

  if (!Array.isArray(products) || !Array.isArray(orders) || products.length > 2000 || orders.length > 50_000) {
    return res.status(400).json({ error: 'Formato inválido para el espacio aislado.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(771234992)');
    const payload = { products, orders };
    const result = await client.query(
      `INSERT INTO mfb_other_workspace (workspace_key, payload, updated_at)
       VALUES ('default', $1::jsonb, NOW())
       ON CONFLICT (workspace_key)
       DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
       RETURNING updated_at`,
      [JSON.stringify(payload)]
    );
    await client.query('COMMIT');
    res.json({
      ok: true,
      saved: { products: products.length, orders: orders.length },
      updatedAt: result.rows[0]?.updated_at || null
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    console.error('Error al guardar mfb_other_workspace:', error);
    res.status(500).json({ error: 'No se pudo guardar el espacio aislado en NeonDB.' });
  } finally {
    client.release();
  }
});

app.get('/api/orders/:uuid', async (req, res) => {
  const uuid = String(req.params.uuid || '').toLowerCase();
  if (!UUID_V4.test(uuid)) return res.status(400).json({ error: 'El código de seguimiento no es válido.' });
  try {
    const result = await pool.query('SELECT * FROM mfb_orders WHERE uuid = $1 LIMIT 1', [uuid]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Pedido no encontrado.' });
    const order = mapOrder(result.rows[0]);
    // Datos estrictamente necesarios para seguimiento y comprobante público.
    res.json({ order: {
      id: order.id,
      uuid: order.uuid,
      customerName: order.customerName,
      city: order.city,
      neighborhood: order.neighborhood,
      address: order.address,
      postalCode: order.postalCode,
      formattedAddress: order.formattedAddress,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      items: order.items,
      discount: order.discount,
      total: order.total,
      createdAt: order.createdAt
    } });
  } catch (error) {
    console.error('Consulta de seguimiento falló:', error);
    res.status(503).json({ error: 'No se pudo consultar el pedido en la base de datos.' });
  }
});

// In production, serve the Vite build from the same origin as the API.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath, { index: false, maxAge: '1h' }));
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), error => {
    if (error) res.status(404).send('Frontend no encontrado. Ejecuta npm run build.');
  });
});

const server = app.listen(PORT, '0.0.0.0', async () => {
  try {
    await initializeDatabase();
    console.log(`MyFanBox API escuchando en http://0.0.0.0:${PORT}`);
  } catch (error) {
    console.error('No se pudo inicializar NeonDB:', error);
    process.exit(1);
  }
});

async function shutdown(signal) {
  console.log(`Recibida señal ${signal}. Cerrando servidor…`);
  server.close(async () => {
    await pool.end().catch(() => undefined);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));