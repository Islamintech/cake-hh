import { HttpError } from '../utils/HttpError.js';

/** Validate req.body against a zod schema and replace it with the parsed (defaulted, trimmed) value. */
export const validateBody = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse(req.body ?? {});
  if (!parsed.success) return next(HttpError.fromZod(parsed.error));
  req.body = parsed.data;
  next();
};
