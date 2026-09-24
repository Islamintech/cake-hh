import type { Request, Response } from 'express';
import type { PartnerModel } from '../models/Partner.js';
import { partnerView } from '../views/miscViews.js';
import type { PartnerBody } from '../validators/schemas.js';

/** "Partnership" form: bakeries asking to join. */
export function createPartnerController({ Partner }: { Partner: PartnerModel }) {
  return {
    // POST /api/partners  (body validated by partnerSchema)
    create(req: Request, res: Response) {
      const saved = Partner.create(req.body as PartnerBody);
      res.status(201).json({ application: partnerView(saved) });
    },
  };
}
