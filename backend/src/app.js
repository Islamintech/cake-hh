// Composition root: builds models, services and controllers, then mounts routes.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createOrderModel } from './models/Order.js';
import { createHealthController } from './controllers/healthController.js';
import { createSuggestionController } from './controllers/suggestionController.js';
import { createOrderController } from './controllers/orderController.js';
import { createDashboardController } from './controllers/dashboardController.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/index.js';

/**
 * @param db        open better-sqlite3 connection (models/database.js)
 * @param events    order event hub (services/orderEvents.js)
 * @param suggester AI suggestion service (services/suggestionService.js)
 */
export function createApp({ db, events, config, suggester, logger = console }) {
  const Order = createOrderModel(db);
  const controllers = {
    health: createHealthController({ db, suggester }),
    suggestion: createSuggestionController({ suggester }),
    order: createOrderController({ Order, events }),
    dashboard: createDashboardController({ Order, events }),
  };

  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({
    origin: config.corsOrigins.includes('*') ? true : config.corsOrigins,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tracking-Token'],
    exposedHeaders: ['Location'],
    maxAge: 600,
  }));
  app.use(express.json({ limit: '64kb' }));
  app.use(requestLogger({ logger, quiet: config.quiet }));

  app.use('/api', apiRouter({ config, controllers }));
  app.use(errorHandler(logger));
  return app;
}
