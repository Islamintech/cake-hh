import { rateLimit } from 'express-rate-limit';
import { HttpError } from '../utils/HttpError.js';

/** Per-IP limiter: `limit` requests per window. Disabled when config.disableRateLimit is set (tests). */
export const rateLimiter = (config, limit, windowMs = 60_000) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: () => !!config.disableRateLimit,
  handler: (_req, _res, next) => next(new HttpError(429, 'rate_limited', 'Too many requests. Please wait a moment.')),
});
