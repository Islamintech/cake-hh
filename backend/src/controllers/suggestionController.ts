import type { Request, Response } from 'express';
import { parseOptions } from '../models/DietaryOptions.js';
import { cleanText } from '../utils/text.js';
import { suggestionView } from '../views/miscViews.js';
import type { Suggester } from '../types.js';
import type { SuggestionBody } from '../validators/schemas.js';

export function createSuggestionController({ suggester }: { suggester: Suggester }) {
  return {
    // POST /api/ai/suggest  (body validated by suggestionSchema)
    async create(req: Request, res: Response) {
      const input = req.body as SuggestionBody;
      const opts = parseOptions(input.options);
      const result = await suggester.suggest({
        occasion: input.occasion ?? null,
        cravings: [...new Set(input.cravings)],
        sweet: input.sweet ?? null,
        text: cleanText(input.text, 140),
      }, opts);
      res.json(suggestionView(opts, result));
    },
  };
}
