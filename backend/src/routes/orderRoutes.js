import { Router } from 'express';
import { validateBody } from '../middleware/validate.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { orderSchema } from '../validators/schemas.js';

/** Guest checkout and tracking. Tracking is authorized by the order's secret token. */
export function orderRoutes({ config, controllers }) {
  const r = Router();
  const c = controllers.order;
  r.post('/', rateLimiter(config, 10), validateBody(orderSchema), c.create);
  r.get('/:code', c.show);
  r.get('/:code/stream', c.stream);
  return r;
}
