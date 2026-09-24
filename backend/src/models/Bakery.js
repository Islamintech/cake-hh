import { BAKERIES, BATTERS, FROSTINGS, TOPPINGS, SIZES } from './catalog.js';
import { lockReason, stocked } from './DietaryOptions.js';
import { HttpError } from '../utils/HttpError.js';
import { seoulToday, addDays } from '../utils/dates.js';

export const Bakery = {
  all: () => BAKERIES,

  findById: (id) => BAKERIES.find((b) => b.id === id) || null,

  findOrFail(id) {
    const b = Bakery.findById(id);
    if (!b) throw HttpError.notFound('Bakery not found.');
    return b;
  },

  /** A bakery fits if it meets halal and can make at least one allowed batter + frosting. */
  fits(b, opts) {
    if (opts.has('halal') && !b.halal) return false;
    return BATTERS.some((x) => stocked(x, b.id) && !lockReason(x, opts))
      && FROSTINGS.some((x) => stocked(x, b.id) && !lockReason(x, opts));
  },

  /** Throw if this bakery can't serve these options at all. */
  assertSuits(b, opts) {
    if (opts.has('halal') && !b.halal) throw HttpError.unprocessable('bakery_unsuitable', `${b.name} is not halal.`);
  },

  /** Ingredients the bakery stocks, each annotated with a lock reason (or null). */
  menu(b, opts) {
    const annotate = (list) => list.filter((x) => stocked(x, b.id))
      .map(({ only, ...x }) => ({ ...x, locked: lockReason(x, opts) }));
    return { batters: annotate(BATTERS), frostings: annotate(FROSTINGS), toppings: annotate(TOPPINGS) };
  },

  fromPrice: (b) => Math.round((SIZES[0].price * b.mult) / 100) * 100,

  earliestDate: (b, today = seoulToday()) => addDays(today, b.leadDays),

  halalNotice: (b, opts) => (b.trust === 'self' && opts.has('halal')
    ? "This bakery says it's halal but hasn't shown us a certificate yet." : null),
};
