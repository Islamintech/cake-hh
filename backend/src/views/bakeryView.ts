import { Bakery } from '../models/Bakery.js';
import type { Actor, Bakery as BakeryT, OptionSet } from '../types.js';

/** A bakery as shown in the "Pick a bakery" list. */
export function bakeryCardView(b: BakeryT, opts: OptionSet) {
  return {
    ...b,
    fromPrice: Bakery.fromPrice(b),
    earliestDate: Bakery.earliestDate(b),
    notice: Bakery.halalNotice(b, opts),
    fits: Bakery.fits(b, opts),
  };
}

export const bakeryListView = (bakeries: BakeryT[], opts: OptionSet) => ({
  options: [...opts],
  bakeries: bakeries.map((b) => bakeryCardView(b, opts)),
});

/** One bakery with its menu; each ingredient says whether it is locked and why. */
export const bakeryDetailView = (b: BakeryT, opts: OptionSet) => ({ ...bakeryCardView(b, opts), menu: Bakery.menu(b, opts) });

/** Who a dashboard key belongs to. */
export const staffView = (actor: Actor) => (actor.role === 'admin'
  ? { role: 'admin' as const, bakeries: Bakery.all() }
  : { role: 'bakery' as const, bakery: Bakery.findById(actor.bakeryId) });
