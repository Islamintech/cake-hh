import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { notFound } from '../middleware/errorHandler.js';
import { publicRoutes } from './publicRoutes.js';
import { orderRoutes } from './orderRoutes.js';
import { dashboardRoutes } from './dashboardRoutes.js';

/** Everything under /api. */
export function apiRouter(deps) {
  const r = Router();
  r.get('/health', deps.controllers.health.show);
  r.use(rateLimiter(deps.config, 300));
  r.use('/', publicRoutes(deps));
  r.use('/orders', orderRoutes(deps));
  r.use('/bakery', dashboardRoutes(deps));
  r.use(notFound);
  return r;
}
