// Ready-made cakes (the catalog's house presets) for the All cakes / Popular cakes grids.
import { priceOf, presetCake, type CatalogIndex } from './rules';
import type { Bakery, Preset } from './types';

/** Lowest pre-discount price across the bakeries that can make it, for "from ₩…" labels. */
export function fromPrice(ix: CatalogIndex, p: Preset, bakeries: Bakery[]): number | null {
  const mults = bakeries.filter((b) => b.fits).map((b) => b.mult);
  if (!mults.length) return null;
  return priceOf(ix, presetCake(p), Math.min(...mults));
}

/**
 * "Popular" = presets built on classic flavour pairings, strongest first.
 * There is no order-count data yet; swap this for real sales once the API has it.
 */
export function popular(ix: CatalogIndex): Preset[] {
  const score = (p: Preset) => {
    const ids = new Set([p.batter, p.frosting, ...p.toppings]);
    return ix.catalog.pairs.filter((x) => ids.has(x.a) && ids.has(x.b)).reduce((n, x) => n + x.score, 0);
  };
  return ix.catalog.presets.map((p) => ({ p, s: score(p) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.p);
}
