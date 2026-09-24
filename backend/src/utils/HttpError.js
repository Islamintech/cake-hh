/** An error with an HTTP status and a stable machine-readable code. Thrown by models and controllers. */
export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) { return new HttpError(400, 'invalid_request', message, details); }
  static unauthorized(message) { return new HttpError(401, 'unauthorized', message); }
  static notFound(message = 'Not found.') { return new HttpError(404, 'not_found', message); }
  static unprocessable(code, message, details) { return new HttpError(422, code, message, details); }
  static conflict(code, message, details) { return new HttpError(409, code, message, details); }

  /** Turn a zod error into a 400 with per-field messages. */
  static fromZod(err) {
    const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return new HttpError(400, 'invalid_request', details[0]?.message || 'Invalid request.', details);
  }
}
