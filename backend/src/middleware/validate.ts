import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/HttpError.js';

/**
 * Validate req.body against a zod schema and replace it with the parsed (defaulted, trimmed) value.
 * Controllers behind this can safely read `req.body as z.infer<typeof schema>`.
 */
export const validateBody = (schema: ZodType): RequestHandler => (req, _res, next) => {
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return next(HttpError.fromZod(parsed.error));
  req.body = parsed.data;
  next();
};
