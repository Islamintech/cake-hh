import { Router } from 'express';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { notFound } from '../middleware/errorHandler.js';
import { publicRoutes } from './publicRoutes.js';
import { orderRoutes } from './orderRoutes.js';
import { dashboardRoutes } from './dashboardRoutes.js';
import type { createHealthController } from '../controllers/healthController.js';
import type { createSuggestionController } from '../controllers/suggestionController.js';
import type { createOrderController } from '../controllers/orderController.js';
import type { createDashboardController } from '../controllers/dashboardController.js';
import type { createPartnerController } from '../controllers/partnerController.js';
import type { AppConfig } from '../types.js';

export interface Controllers {
  health: ReturnType<typeof createHealthController>;
  suggestion: ReturnType<typeof createSuggestionController>;
  order: ReturnType<typeof createOrderController>;
  dashboard: ReturnType<typeof createDashboardController>;
  partner: ReturnType<typeof createPartnerController>;
}

export interface RouteDeps { config: AppConfig; controllers: Controllers }

/** Everything under /api. */
export function apiRouter(deps: RouteDeps): Router {
  const r = Router();
  r.get('/health', deps.controllers.health.show);
  r.use(rateLimiter(deps.config, 300));
  r.use('/', publicRoutes(deps));
  r.use('/orders', orderRoutes(deps));
  r.use('/bakery', dashboardRoutes(deps));
  r.use(notFound);
  return r;
}
