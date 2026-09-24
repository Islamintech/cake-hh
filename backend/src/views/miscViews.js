/** Price quote for a validated cake. */
export const quoteView = (bakery, cake, q) => ({ bakeryId: bakery.id, cake, ...q });

/** AI or house-recipe suggestions. */
export const suggestionView = (opts, result) => ({ options: [...opts], ...result });

export const healthView = ({ dbOk, aiEnabled }) => ({
  ok: dbOk,
  db: dbOk ? 'up' : 'down',
  ai: aiEnabled ? 'claude' : 'local',
  time: new Date().toISOString(),
});

/** Standard error envelope: { error: { code, message, details? } }. */
export const errorView = (err) => ({
  error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
});
