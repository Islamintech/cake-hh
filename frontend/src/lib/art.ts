// Illustrations in public/art/. Catalog items (toppings, batters, creams, bakeries) only get a picture
// when one exists, so new catalog items or partner bakeries fall back to their emoji or color.

const ITEMS: Record<string, string[]> = {
  toppings: ['straw', 'blue', 'cherry', 'kiwi', 'peach', 'yuja', 'choc', 'cookie', 'peanut', 'mint', 'star', 'gummy', 'candle'],
  batters: ['vanilla', 'chocolate', 'matcha', 'redvelvet', 'goguma', 'rice', 'oat'],
  creams: ['whip', 'cheese', 'ganache', 'berry', 'yogurt', 'coconut', 'rum'],
  bakeries: ['s1', 's2', 's3'],
};

const BY_ID: Record<string, string> = Object.fromEntries(
  Object.entries(ITEMS).flatMap(([dir, ids]) => ids.map((id) => [id, `${dir}/${id}`])),
);

/** URL of a picture in public/art, e.g. art('status/baking'). */
export const art = (path: string) => `/art/${path}.png`;

/** Path ('toppings/straw') of a catalog item's picture, or null if it has none. */
export const itemArt = (id: string): string | null => BY_ID[id] ?? null;

/** Path of a bakery's logo, or null if it has none. */
export const bakeryArt = (id: string): string | null => (ITEMS.bakeries!.includes(id) ? `bakeries/${id}` : null);
