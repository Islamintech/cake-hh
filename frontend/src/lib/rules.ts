// Client-side helpers for instant feedback while building. The server re-checks everything
// (price, safety, stock) on /api/quote and /api/orders, so these never decide anything final.
import type { CakeDesign, Catalog, Ingredient, Layer, MenuItem, Pair, Preset, Size } from './types';

export interface CatalogIndex {
  catalog: Catalog;
  byId: Record<string, Ingredient>;
  sizeById: Record<string, Size>;
}

export function indexCatalog(catalog: Catalog): CatalogIndex {
  const byId: Record<string, Ingredient> = {};
  for (const x of [...catalog.batters, ...catalog.frostings, ...catalog.toppings]) byId[x.id] = x;
  return { catalog, byId, sizeById: Object.fromEntries(catalog.sizes.map((s) => [s.id, s])) };
}

export const newLayer = (): Layer => ({ batter: null, baked: false, frosting: null, toppings: [] });
export const freshCake = (): CakeDesign => ({ shape: null, size: null, layers: [newLayer()], lettering: '' });

export type Station = 'pan' | 'size' | 'batter' | 'oven' | 'frosting' | 'toppings' | 'lettering' | 'box';
export const ALL_STATIONS: Station[] = ['pan', 'size', 'batter', 'oven', 'frosting', 'toppings', 'lettering', 'box'];
export const stationsFor = (layer: number): Station[] =>
  layer === 0 ? ['pan', 'size', 'batter', 'oven', 'frosting', 'toppings'] : ['batter', 'oven', 'frosting', 'toppings'];

export interface Step { layer: number; i: number; phase: 'build' | 'finish' }
export const curStation = (s: Step): Station =>
  (s.phase === 'finish' ? (['lettering', 'box'] as const)[s.i] : stationsFor(s.layer)[s.i]) ?? 'pan';

/** Price in KRW before the guest discount, same formula as the server. */
export function priceOf(ix: CatalogIndex, cake: CakeDesign, mult: number): number {
  const { rules } = ix.catalog;
  let p = cake.size ? ix.sizeById[cake.size]?.price ?? 0 : 0;
  cake.layers.forEach((L, i) => {
    if (i > 0) p += rules.extraLayerPrice;
    if (L.batter) p += ix.byId[L.batter]?.price ?? 0;
    if (L.frosting) p += ix.byId[L.frosting]?.price ?? 0;
    L.toppings.forEach((t) => { p += ix.byId[t.id]?.price ?? 0; });
  });
  if (cake.lettering) p += rules.letteringPrice;
  return Math.round((p * mult) / 100) * 100;
}

export function combosOf(ix: CatalogIndex, cake: CakeDesign): Pair[] {
  const ids = new Set<string>();
  cake.layers.forEach((L) => {
    if (L.batter) ids.add(L.batter);
    if (L.frosting) ids.add(L.frosting);
    L.toppings.forEach((t) => ids.add(t.id));
  });
  return ix.catalog.pairs.filter((p) => ids.has(p.a) && ids.has(p.b));
}

export function describeCake(ix: CatalogIndex, cake: CakeDesign): string[] {
  return cake.layers.map((L, i) => {
    const tops: Record<string, number> = {};
    L.toppings.forEach((t) => { tops[t.id] = (tops[t.id] ?? 0) + 1; });
    const tt = Object.entries(tops).map(([id, n]) => `${ix.byId[id]?.name.toLowerCase() ?? id}${n > 1 ? ' ×' + n : ''}`).join(', ');
    const prefix = cake.layers.length > 1 ? `Layer ${i + 1}: ` : '';
    return `${prefix}${(L.batter && ix.byId[L.batter]?.name) || '?'} sponge, ${(L.frosting && ix.byId[L.frosting]?.name.toLowerCase()) || 'no cream'}${tt ? ', ' + tt : ''}`;
  });
}

/** A ready-made cake from a suggestion/preset: toppings arranged in a ring. */
export function presetCake(p: Pick<Preset, 'batter' | 'frosting' | 'toppings'>): CakeDesign {
  const n = p.toppings.length;
  return {
    shape: 'round',
    size: 'm',
    lettering: '',
    layers: [{
      batter: p.batter,
      baked: true,
      frosting: p.frosting,
      toppings: p.toppings.map((id, k) => {
        const ang = (k / n) * Math.PI * 2 + 0.4;
        const r = n > 1 ? 0.55 : 0;
        return { id, fx: +(Math.cos(ang) * r).toFixed(2), fy: +(Math.sin(ang) * r * 0.8).toFixed(2) };
      }),
    }],
  };
}

/** Swap anything a bakery doesn't stock (or that is locked) for something it can make. */
export function fitPresetToMenu(cake: CakeDesign, menu: { batters: MenuItem[]; frostings: MenuItem[]; toppings: MenuItem[] }): CakeDesign {
  const okIds = (list: MenuItem[]) => new Set(list.filter((x) => !x.locked).map((x) => x.id));
  const bats = okIds(menu.batters), frs = okIds(menu.frostings), tops = okIds(menu.toppings);
  const L = cake.layers[0]!;
  return {
    ...cake,
    layers: [{
      ...L,
      batter: L.batter && bats.has(L.batter) ? L.batter : [...bats][0] ?? null,
      frosting: L.frosting && frs.has(L.frosting) ? L.frosting : [...frs][0] ?? null,
      toppings: L.toppings.filter((t) => tops.has(t.id)),
    }],
  };
}

/** Deep copy, so every cake change produces a new object (and a re-render). */
export const cloneCake = (c: CakeDesign): CakeDesign => structuredClone(c);
