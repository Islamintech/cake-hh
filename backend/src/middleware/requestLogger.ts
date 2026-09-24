import type { RequestHandler } from 'express';
import type { Logger } from '../types.js';

/** Access log. Path only: query strings can carry tracking tokens and SSE keys. */
export function requestLogger({ logger = console, quiet = false }: { logger?: Logger; quiet?: boolean } = {}): RequestHandler {
  return (req, res, next) => {
    if (quiet) return next();
    const t = process.hrtime.bigint();
    const path = req.path; // capture before routers rewrite req.url
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - t) / 1e6;
      logger.info?.(`${req.method} ${path} ${res.statusCode} ${ms.toFixed(1)}ms`);
    });
    next();
  };
}
