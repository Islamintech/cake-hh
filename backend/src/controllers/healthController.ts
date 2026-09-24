import type { Request, Response } from 'express';
import { isHealthy, type DB } from '../models/database.js';
import { healthView } from '../views/miscViews.js';
import type { Suggester } from '../types.js';

export function createHealthController({ db, suggester }: { db: DB; suggester: Suggester }) {
  return {
    // GET /api/health
    show(_req: Request, res: Response) {
      const dbOk = isHealthy(db);
      res.status(dbOk ? 200 : 503).json(healthView({ dbOk, aiEnabled: suggester.enabled }));
    },
  };
}
