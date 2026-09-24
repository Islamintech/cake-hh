import { BAKERIES, BATTERS, FROSTINGS, TOPPINGS, SIZES } from './catalog.js';
import { lockReason, stocked } from './DietaryOptions.js';
import { HttpError } from '../utils/HttpError.js';
import { seoulToday, addDays } from '../utils/dates.js';
import type { Bakery as BakeryT, Ingredient, OptionSet } from '../types.js';

export type MenuItem = Omit<Ingredient, 'only'> & { locked: string | null };
export interface Menu { batters: MenuItem[]; frostings: MenuItem[]; toppings: MenuItem[] }

export const Bakery = {
  all: (): BakeryT[] => BAKERIES,

  findById: (id: string): BakeryT | null => BAKERIES.find((b) => b.id === id) ?? null,

  findOrFail(id: string): BakeryT {
    const b = Bakery.findById(id);
    if (!b) throw HttpError.notFound('Bakery not found.');
    return b;
  },

  /** A bakery fits if it meets halal and can make at least one allowed batter + frosting. */
  fits(b: BakeryT, opts: OptionSet): boolean {
    if (opts.has('halal') && !b.halal) return false;
    return BATTERS.some((x) => stocked(x, b.id) && !lockReason(x, opts))
      && FROSTINGS.some((x) => stocked(x, b.id) && !lockReason(x, opts));
  },

  /** Throw if this bakery can't serve these options at all. */
  assertSuits(b: BakeryT, opts: OptionSet): void {
    if (opts.has('halal') && !b.halal) throw HttpError.unprocessable('bakery_unsuitable', `${b.name} is not halal.`);
  },

  /** Ingredients the bakery stocks, each annotated with a lock reason (or null). */
  menu(b: BakeryT, opts: OptionSet): Menu {
    const annotate = (list: Ingredient[]): MenuItem[] => list.filter((x) => stocked(x, b.id))
      .map(({ only: _only, ...x }) => ({ ...x, locked: lockReason({ ...x }, opts) }));
    return { batters: annotate(BATTERS), frostings: annotate(FROSTINGS), toppings: annotate(TOPPINGS) };
  },

  fromPrice: (b: BakeryT): number => Math.round(((SIZES[0]?.price ?? 0) * b.mult) / 100) * 100,

  earliestDate: (b: BakeryT, today: string = seoulToday()): string => addDays(today, b.leadDays),

  halalNotice: (b: BakeryT, opts: OptionSet): string | null => (b.trust === 'self' && opts.has('halal')
    ? "This bakery says it's halal but hasn't shown us a certificate yet." : null),
};
