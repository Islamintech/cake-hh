import dotenv from 'dotenv';
import { BAKERIES } from '../models/catalog.js';
import type { AppConfig } from '../types.js';

dotenv.config({ quiet: true });

/** "s1:key,s2:key,..." -> { s1: 'key', ... } */
function parseBakeryKeys(raw: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (raw ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const i = pair.indexOf(':');
    if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
  }
  return out;
}

export function loadConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  const env = process.env;
  const cfg: AppConfig = {
    isProd: env.NODE_ENV === 'production',
    port: Number(env.PORT) || 4000,
    host: env.HOST || '0.0.0.0',
    dbPath: env.DB_PATH || './data/cake-kitchen.db',
    corsOrigins: (env.CORS_ORIGINS || '*').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY === 'true' || env.TRUST_PROXY === '1',
    anthropicApiKey: env.ANTHROPIC_API_KEY || '',
    anthropicModel: env.ANTHROPIC_MODEL || 'claude-opus-5-5',
    groqApiKey: env.GROQ_API_KEY || '',
    groqModel: env.GROQ_MODEL || 'openai/gpt-oss-120b',
    aiTimeoutMs: Number(env.AI_TIMEOUT_MS) || 20000,
    adminKey: env.ADMIN_KEY || '',
    bakeryKeys: parseBakeryKeys(env.BAKERY_KEYS),
    usingDevKeys: false,
    ...overrides,
  };

  // Dev convenience: predictable keys so the demo dashboard works out of the box.
  // In production missing keys are a startup error (see assertConfig).
  if (!cfg.isProd) {
    if (!cfg.adminKey) { cfg.adminKey = 'dev-admin-key'; cfg.usingDevKeys = true; }
    for (const b of BAKERIES) {
      if (!cfg.bakeryKeys[b.id]) { cfg.bakeryKeys[b.id] = `dev-bakery-${b.id}`; cfg.usingDevKeys = true; }
    }
  }
  return cfg;
}

/** Problems that should stop the server from starting. Empty = OK. */
export function assertConfig(cfg: AppConfig): string[] {
  const problems: string[] = [];
  if (cfg.isProd) {
    if (!cfg.adminKey || cfg.adminKey.length < 24) problems.push('ADMIN_KEY must be set (24+ chars) in production.');
    for (const b of BAKERIES) {
      const k = cfg.bakeryKeys[b.id];
      if (!k || k.length < 24) problems.push(`BAKERY_KEYS must include ${b.id} with a 24+ char key in production.`);
    }
    if (cfg.corsOrigins.includes('*')) problems.push('CORS_ORIGINS must list your frontend origin(s) in production, not "*".');
  }
  for (const id of Object.keys(cfg.bakeryKeys)) {
    if (!BAKERIES.some((b) => b.id === id)) problems.push(`BAKERY_KEYS has unknown bakery id "${id}".`);
  }
  return problems;
}
