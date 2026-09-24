import { HttpError } from '../utils/HttpError.js';
import { errorView } from '../views/miscViews.js';

export const notFound = (_req, _res, next) => next(HttpError.notFound('No such endpoint.'));

/** Last middleware: turns any error into the standard JSON envelope. Unknown errors become a logged 500. */
export function errorHandler(logger = console) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, _next) => {
    if (err.type === 'entity.parse.failed') err = new HttpError(400, 'invalid_json', 'Request body is not valid JSON.');
    else if (err.type === 'entity.too.large') err = new HttpError(413, 'too_large', 'Request body is too large.');
    if (!(err instanceof HttpError)) {
      logger.error?.(`[error] ${req.method} ${req.path}`, err);
      err = new HttpError(500, 'internal', 'Something went wrong on our side.');
    }
    if (res.headersSent) return res.end();
    res.status(err.status).json(errorView(err));
  };
}
