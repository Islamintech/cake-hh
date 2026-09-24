import { Bakery } from '../models/Bakery.js';

/** A bakery as shown in the "Pick a bakery" list. */
export function bakeryCardView(b, opts) {
  return {
    ...b,
    fromPrice: Bakery.fromPrice(b),
    earliestDate: Bakery.earliestDate(b),
    notice: Bakery.halalNotice(b, opts),
    fits: Bakery.fits(b, opts),
  };
}

export const bakeryListView = (bakeries, opts) => ({
  options: [...opts],
  bakeries: bakeries.map((b) => bakeryCardView(b, opts)),
});

/** One bakery with its menu; each ingredient says whether it is locked and why. */
export const bakeryDetailView = (b, opts) => ({ ...bakeryCardView(b, opts), menu: Bakery.menu(b, opts) });

/** Who a dashboard key belongs to. */
export const staffView = (actor) => (actor.role === 'admin'
  ? { role: 'admin', bakeries: Bakery.all() }
  : { role: 'bakery', bakery: Bakery.findById(actor.bakeryId) });
