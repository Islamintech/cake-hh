import { Router } from 'express';
import { requireBakery } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { statusSchema } from '../validators/schemas.js';
import type { RouteDeps } from './index.js';

/** Bakery dashboard. Every route needs a bakery or admin key. */
export function dashboardRoutes({ config, controllers }: RouteDeps): Router {
  const r = Router();
  const c = controllers.dashboard;
  const auth = requireBakery(config);

  r.get('/me', auth, c.me);
  r.get('/orders', auth, c.index);
  r.get('/orders/:code', auth, c.show);
  r.post('/orders/:code/status', auth, validateBody(statusSchema), c.updateStatus);
  // `?key=` accepted here because EventSource can't set headers.
  r.get('/stream', requireBakery(config, { allowQuery: true }), c.stream);
  return r;
}
