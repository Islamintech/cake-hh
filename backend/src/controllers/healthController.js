import { isHealthy } from '../models/database.js';
import { healthView } from '../views/miscViews.js';

export function createHealthController({ db, suggester }) {
  return {
    // GET /api/health
    show(_req, res) {
      const dbOk = isHealthy(db);
      res.status(dbOk ? 200 : 503).json(healthView({ dbOk, aiEnabled: suggester.enabled }));
    },
  };
}
