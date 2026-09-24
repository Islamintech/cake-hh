import type { ZodError } from 'zod';

export interface ErrorDetail { path: string; message: string }

/** An error with an HTTP status and a stable machine-readable code. Thrown by models and controllers. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(message: string, details?: unknown) { return new HttpError(400, 'invalid_request', message, details); }
  static unauthorized(message: string) { return new HttpError(401, 'unauthorized', message); }
  static notFound(message = 'Not found.') { return new HttpError(404, 'not_found', message); }
  static unprocessable(code: string, message: string, details?: unknown) { return new HttpError(422, code, message, details); }
  static conflict(code: string, message: string, details?: unknown) { return new HttpError(409, code, message, details); }

  /** Turn a zod error into a 400 with per-field messages. */
  static fromZod(err: ZodError): HttpError {
    const details: ErrorDetail[] = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return new HttpError(400, 'invalid_request', details[0]?.message || 'Invalid request.', details);
  }
}
