import * as C from '../models/catalog.js';

// `only` is an internal field; expose it as a list of bakery ids (null = every bakery).
const ingredient = ({ only, ...rest }) => ({ ...rest, bakeries: only || null });

/** Everything the builder UI needs in one payload. */
export function catalogView() {
  return {
    shapes: C.SHAPES,
    sizes: C.SIZES,
    batters: C.BATTERS.map(ingredient),
    frostings: C.FROSTINGS.map(ingredient),
    toppings: C.TOPPINGS.map(ingredient),
    options: C.OPTIONS,
    pairs: C.PAIRS.map(([a, b, score, message]) => ({ a, b, score, message })),
    presets: C.PRESETS,
    occasions: C.OCCASIONS,
    cravings: C.CRAVINGS.map(([id, label]) => ({ id, label })),
    sweetness: C.SWEET.map(([value, label]) => ({ value, label })),
    timeSlots: C.TIME_SLOTS,
    rules: {
      guestDiscount: C.GUEST_DISCOUNT,
      extraLayerPrice: C.EXTRA_LAYER_PRICE,
      letteringPrice: C.LETTERING_PRICE,
      maxToppingsPerLayer: C.MAX_TOPPINGS_PER_LAYER,
      maxLettering: C.MAX_LETTERING,
      maxDaysAhead: C.MAX_DAYS_AHEAD,
      currency: 'KRW',
      timezone: C.TIMEZONE,
    },
  };
}
