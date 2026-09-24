// Composition root: builds models, services and controllers, then mounts routes.
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createOrderModel } from './models/Order.js';
import { createPartnerModel } from './models/Partner.js';
import type { DB } from './models/database.js';
import { createHealthController } from './controllers/healthController.js';
import { createSuggestionController } from './controllers/suggestionController.js';
import { createOrderController } from './controllers/orderController.js';
import { createDashboardController } from './controllers/dashboardController.js';
import { createPartnerController } from './controllers/partnerController.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter, type Controllers } from './routes/index.js';
import type { AppConfig, Logger, OrderEvents, Suggester } from './types.js';

export interface AppDeps {
  /** Open better-sqlite3 connection (models/database.ts). */
  db: DB;
  /** Order event hub (services/orderEvents.ts). */
  events: OrderEvents;
  config: AppConfig;
  /** AI suggestion service (services/suggestionService.ts). */
  suggester: Suggester;
  logger?: Logger;
}

export function createApp({ db, events, config, suggester, logger = console }: AppDeps): Express {
  const Order = createOrderModel(db);
  const controllers: Controllers = {
    health: createHealthController({ db, suggester }),
    suggestion: createSuggestionController({ suggester }),
    order: createOrderController({ Order, events }),
    dashboard: createDashboardController({ Order, events }),
    partner: createPartnerController({ Partner: createPartnerModel(db) }),
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
