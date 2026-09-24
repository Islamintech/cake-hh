import { Router } from 'express';
import { catalogController } from '../controllers/catalogController.js';
import { validateBody } from '../middleware/validate.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { quoteSchema, suggestionSchema } from '../validators/schemas.js';
import type { RouteDeps } from './index.js';

/** Catalog, bakeries, quotes and AI suggestions. No auth. */
export function publicRoutes({ config, controllers }: RouteDeps): Router {
  const r = Router();
  r.get('/catalog', catalogController.show);
  r.get('/bakeries', catalogController.listBakeries);
  r.get('/bakeries/:id', catalogController.showBakery);
  r.post('/quote', validateBody(quoteSchema), catalogController.quote);
  r.post('/ai/suggest', rateLimiter(config, 10), validateBody(suggestionSchema), controllers.suggestion.create);
  return r;
}
