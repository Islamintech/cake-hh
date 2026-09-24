import type { Request, RequestHandler } from 'express';
import { HttpError } from '../utils/HttpError.js';
import { safeEqual } from '../utils/secure.js';
import type { Actor, AppConfig } from '../types.js';

/** Read a bearer key from the Authorization header, or `?key=` (EventSource can't send headers). */
function presentedKey(req: Request, allowQuery: boolean): string | null {
  const m = /^Bearer\s+(.+)$/i.exec(req.get('authorization') ?? '');
  if (m?.[1]) return m[1].trim();
  if (allowQuery && typeof req.query.key === 'string') return req.query.key;
  return null;
}

/**
 * Bakery staff auth. Sets req.actor = { role: 'bakery', bakeryId } or { role: 'admin' }.
 * Admin sees every bakery (used by the hackathon demo dashboard).
 */
export function requireBakery(config: Pick<AppConfig, 'adminKey' | 'bakeryKeys'>, { allowQuery = false } = {}): RequestHandler {
  return (req, _res, next) => {
    const key = presentedKey(req, allowQuery);
    if (!key) return next(HttpError.unauthorized('Bakery key required.'));
    if (config.adminKey && safeEqual(key, config.adminKey)) {
      req.actor = { role: 'admin' };
      return next();
    }
    for (const [bakeryId, k] of Object.entries(config.bakeryKeys)) {
      if (k && safeEqual(key, k)) {
        req.actor = { role: 'bakery', bakeryId };
        return next();
      }
    }
    return next(HttpError.unauthorized('Invalid bakery key.'));
  };
}

/** The authenticated actor. Only call behind requireBakery. */
export function actorOf(req: Request): Actor {
  if (!req.actor) throw HttpError.unauthorized('Bakery key required.');
  return req.actor;
}
