import { parseOptions } from '../models/DietaryOptions.js';
import { cleanText } from '../utils/text.js';
import { suggestionView } from '../views/miscViews.js';

export function createSuggestionController({ suggester }) {
  return {
    // POST /api/ai/suggest
    async create(req, res) {
      const input = req.body;
      const opts = parseOptions(input.options);
      const result = await suggester.suggest({
        occasion: input.occasion || null,
        cravings: [...new Set(input.cravings)],
        sweet: input.sweet || null,
        text: cleanText(input.text, 140),
      }, opts);
      res.json(suggestionView(opts, result));
    },
  };
}
