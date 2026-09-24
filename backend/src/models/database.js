import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  code           TEXT NOT NULL UNIQUE,
  tracking_token TEXT NOT NULL,
  bakery_id      TEXT NOT NULL,
  status         TEXT NOT NULL,
  cake           TEXT NOT NULL,
  options        TEXT NOT NULL,
  customer       TEXT NOT NULL,
  date           TEXT NOT NULL,
  time           TEXT NOT NULL,
  subtotal       INTEGER NOT NULL,
  discount       INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  stats          TEXT NOT NULL,
  taste_profile  TEXT,
  photo_url      TEXT,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_bakery_created ON orders (bakery_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);

CREATE TABLE IF NOT EXISTS order_events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status    TEXT NOT NULL,
  actor     TEXT NOT NULL,
  at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_order ON order_events (order_id, at);
`;

/** Open (and create if needed) the SQLite database with the schema applied. */
export function openDatabase(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');
  db.exec(SCHEMA);
  return db;
}

export function isHealthy(db) {
  try { return db.prepare('SELECT 1 AS ok').get().ok === 1; } catch { return false; }
}
