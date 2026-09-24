import type { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../utils/HttpError.js';
import { errorView } from '../views/miscViews.js';
import type { Logger } from '../types.js';

export const notFound: RequestHandler = (_req, _res, next) => next(HttpError.notFound('No such endpoint.'));

/** body-parser errors carry a `type` field. */
const bodyErrorType = (err: unknown): string | undefined =>
  typeof err === 'object' && err !== null && 'type' in err ? String((err as { type: unknown }).type) : undefined;

/** Last middleware: turns any error into the standard JSON envelope. Unknown errors become a logged 500. */
export function errorHandler(logger: Logger = console): ErrorRequestHandler {
  return (err: unknown, req, res, _next) => {
    let e: HttpError;
    const type = bodyErrorType(err);
    if (err instanceof HttpError) e = err;
    else if (type === 'entity.parse.failed') e = new HttpError(400, 'invalid_json', 'Request body is not valid JSON.');
    else if (type === 'entity.too.large') e = new HttpError(413, 'too_large', 'Request body is too large.');
    else {
      logger.error?.(`[error] ${req.method} ${req.path}`, err);
      e = new HttpError(500, 'internal', 'Something went wrong on our side.');
    }
    if (res.headersSent) { res.end(); return; }
    res.status(e.status).json(errorView(e));
  };
}
