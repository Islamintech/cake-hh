import type { Request, Response } from 'express';
import { Bakery } from '../models/Bakery.js';
import { parseOptions } from '../models/DietaryOptions.js';
import { validateCakeOrFail, quote } from '../models/Cake.js';
import { catalogView } from '../views/catalogView.js';
import { bakeryListView, bakeryDetailView } from '../views/bakeryView.js';
import { quoteView } from '../views/miscViews.js';
import type { QuoteBody } from '../validators/schemas.js';

/** `?options=halal,no_milk` or repeated `?options=a&options=b` -> list of ids. */
const optionIdsFromQuery = (q: unknown): string[] => (Array.isArray(q) ? q.join(',') : String(q ?? ''))
  .split(',').map((s) => s.trim()).filter(Boolean);

export const catalogController = {
  // GET /api/catalog
  show(_req: Request, res: Response) {
    res.set('Cache-Control', 'public, max-age=300');
    res.json(catalogView());
  },

  // GET /api/bakeries?options=...&all=true
  listBakeries(req: Request, res: Response) {
    const opts = parseOptions(optionIdsFromQuery(req.query.options));
    const list = req.query.all === 'true' ? Bakery.all() : Bakery.all().filter((b) => Bakery.fits(b, opts));
    res.json(bakeryListView(list, opts));
  },

  // GET /api/bakeries/:id?options=...
  showBakery(req: Request<{ id: string }>, res: Response) {
    const b = Bakery.findOrFail(req.params.id);
    const opts = parseOptions(optionIdsFromQuery(req.query.options));
    res.json(bakeryDetailView(b, opts));
  },

  // POST /api/quote  (body validated by quoteSchema)
  quote(req: Request, res: Response) {
    const { bakeryId, cake, options } = req.body as QuoteBody;
    const b = Bakery.findOrFail(bakeryId);
    const opts = parseOptions(options);
    Bakery.assertSuits(b, opts);
    const valid = validateCakeOrFail(cake, b, opts);
    res.json(quoteView(b, valid, quote(valid, b, opts)));
  },
};
