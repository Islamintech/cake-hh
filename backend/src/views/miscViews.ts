import type { HttpError } from '../utils/HttpError.js';
import type { Bakery, CakeDesign, OptionSet, Quote, SuggestResult } from '../types.js';

/** Price quote for a validated cake. */
export const quoteView = (bakery: Bakery, cake: CakeDesign, q: Quote) => ({ bakeryId: bakery.id, cake, ...q });

/** AI or house-recipe suggestions. */
export const suggestionView = (opts: OptionSet, result: SuggestResult) => ({ options: [...opts], ...result });

export const healthView = ({ dbOk, aiEnabled }: { dbOk: boolean; aiEnabled: boolean }) => ({
  ok: dbOk,
  db: dbOk ? 'up' : 'down',
  ai: aiEnabled ? 'claude' : 'local',
  time: new Date().toISOString(),
});

/** Standard error envelope: { error: { code, message, details? } }. */
export const errorView = (err: HttpError) => ({
  error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
});
