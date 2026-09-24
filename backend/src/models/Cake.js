// A cake design: validation, pricing, pairing combos and nutrition estimates.
// The server always recomputes these; numbers from the client are never trusted.
import {
  ALL, BATTERS, FROSTINGS, TOPPINGS, SHAPES, SIZES, PAIRS,
  GUEST_DISCOUNT, EXTRA_LAYER_PRICE, LETTERING_PRICE, MAX_TOPPINGS_PER_LAYER, MAX_LETTERING,
} from './catalog.js';
import { lockReason, stocked } from './DietaryOptions.js';
import { cleanText } from '../utils/text.js';
import { HttpError } from '../utils/HttpError.js';

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/**
 * Check a design against the catalog, the bakery's stock and limits, and the customer's options.
 * Returns { cake } (normalized: all layers baked, topping positions clamped) or { errors }.
 */
export function validateCake(input, b, opts) {
  const errors = [];
  if (!input || typeof input !== 'object') return { errors: ['Cake design is missing.'] };
  if (!SHAPES.some((s) => s.id === input.shape)) errors.push('Pick a pan shape (round, square or heart).');
  if (!SIZES.some((s) => s.id === input.size)) errors.push('Pick a size (s, m or l).');

  const layers = Array.isArray(input.layers) ? input.layers : [];
  if (!layers.length) errors.push('A cake needs at least one layer.');
  if (layers.length > b.maxLayers) errors.push(`${b.name} makes up to ${b.maxLayers} layers.`);

  const check = (id, list, kind, n) => {
    const ing = ALL[id];
    if (!ing || !list.includes(ing)) { errors.push(`Layer ${n}: unknown ${kind} "${id}".`); return; }
    if (!stocked(ing, b.id)) { errors.push(`Layer ${n}: ${b.name} doesn't offer ${ing.name}.`); return; }
    const why = lockReason(ing, opts);
    if (why) errors.push(`Layer ${n}: ${ing.name} is not allowed for your options. ${why}`);
  };

  const outLayers = layers.slice(0, b.maxLayers).map((L, i) => {
    const n = i + 1;
    L = L && typeof L === 'object' ? L : {};
    check(L.batter, BATTERS, 'batter', n);
    check(L.frosting, FROSTINGS, 'frosting', n);
    const tops = Array.isArray(L.toppings) ? L.toppings : [];
    if (tops.length > MAX_TOPPINGS_PER_LAYER) errors.push(`Layer ${n}: at most ${MAX_TOPPINGS_PER_LAYER} toppings.`);
    const toppings = tops.slice(0, MAX_TOPPINGS_PER_LAYER).map((t) => {
      const id = typeof t === 'string' ? t : t?.id;
      check(id, TOPPINGS, 'topping', n);
      return { id, fx: +clamp(num(t?.fx), -1, 1).toFixed(2), fy: +clamp(num(t?.fy), -1, 1).toFixed(2) };
    });
    return { batter: L.batter, baked: true, frosting: L.frosting, toppings };
  });

  if (input.lettering != null && typeof input.lettering !== 'string') errors.push('Lettering must be text.');
  const lettering = cleanText(input.lettering, MAX_LETTERING);
  if (typeof input.lettering === 'string' && input.lettering.trim().length > MAX_LETTERING) {
    errors.push(`Lettering can be at most ${MAX_LETTERING} characters.`);
  }

  if (errors.length) return { errors };
  return { cake: { shape: input.shape, size: input.size, layers: outLayers, lettering } };
}

/** validateCake, but throws 422 invalid_cake with every problem listed in details. */
export function validateCakeOrFail(input, b, opts) {
  const v = validateCake(input, b, opts);
  if (v.errors) throw HttpError.unprocessable('invalid_cake', v.errors[0], v.errors);
  return v.cake;
}

export function priceOf(cake, b) {
  const size = SIZES.find((s) => s.id === cake.size);
  let p = size ? size.price : 0;
  cake.layers.forEach((L, i) => {
    if (i > 0) p += EXTRA_LAYER_PRICE;
    if (L.batter) p += ALL[L.batter].price;
    if (L.frosting) p += ALL[L.frosting].price;
    L.toppings.forEach((t) => { p += ALL[t.id].price; });
  });
  if (cake.lettering) p += LETTERING_PRICE;
  return Math.round((p * b.mult) / 100) * 100;
}

export function pricing(cake, b) {
  const subtotal = priceOf(cake, b);
  const discount = Math.round((subtotal * GUEST_DISCOUNT) / 100) * 100;
  return { subtotal, discount, total: subtotal - discount, currency: 'KRW' };
}

export function combosOf(cake) {
  const ids = new Set();
  cake.layers.forEach((L) => {
    if (L.batter) ids.add(L.batter);
    if (L.frosting) ids.add(L.frosting);
    L.toppings.forEach((t) => ids.add(t.id));
  });
  return PAIRS.filter((p) => ids.has(p[0]) && ids.has(p[1]))
    .map(([a, b, score, message]) => ({ a, b, score, message }));
}

/** Per-slice estimates, same formula as the demo's result screen. */
export function statsOf(cake, opts) {
  const size = SIZES.find((s) => s.id === cake.size) || SIZES[1];
  let kcal = 0, sugar = 0, protein = 0;
  cake.layers.forEach((L, i) => {
    const f = i === 0 ? 1 : 0.55;
    for (const id of [L.batter, L.frosting]) {
      if (!id) continue;
      kcal += ALL[id].kcal * f; sugar += ALL[id].sugar * f; protein += ALL[id].protein * f;
    }
    L.toppings.forEach((t) => {
      const x = ALL[t.id];
      kcal += (x.kcal * 3) / size.serv; sugar += (x.sugar * 3) / size.serv; protein += (x.protein * 3) / size.serv;
    });
  });
  const c = combosOf(cake);
  const pos = c.filter((x) => x.score > 0).length;
  const neg = c.filter((x) => x.score < 0).length;
  const lowSugar = opts.has('low_sugar');
  const goal = lowSugar ? sugar * 0.6 <= 15 : cake.layers.some((L) => L.toppings.length > 0);
  const taste = neg === 0 && (pos > 0 || cake.layers.every((L) => L.frosting));
  const match = Math.max(55, Math.min(99, 72 + pos * 9 - neg * 12 + (goal ? 8 : 0) + (cake.lettering ? 3 : 0)));
  return {
    kcal: Math.round(kcal * 0.62), sugar: Math.round(sugar * 0.6), protein: Math.round(protein * 0.7),
    safe: true, taste, goal, match, lowSugar,
  };
}

export function describeCake(cake) {
  return cake.layers.map((L, i) => {
    const tops = {};
    L.toppings.forEach((t) => { tops[t.id] = (tops[t.id] || 0) + 1; });
    const tt = Object.entries(tops).map(([id, n]) => `${ALL[id].name.toLowerCase()}${n > 1 ? ' ×' + n : ''}`).join(', ');
    const prefix = cake.layers.length > 1 ? `Layer ${i + 1}: ` : '';
    return `${prefix}${ALL[L.batter]?.name || '?'} sponge, ${ALL[L.frosting]?.name.toLowerCase() || 'no cream'}${tt ? ', ' + tt : ''}`;
  });
}

/** Price, stats, combos and description for an already-validated cake. */
export function quote(cake, b, opts) {
  return { ...pricing(cake, b), stats: statsOf(cake, opts), combos: combosOf(cake), description: describeCake(cake) };
}
