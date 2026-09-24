// Dietary safety rules. These are fixed rules on each ingredient, never AI guesses.
import { OPTIONS } from './catalog.js';
import { HttpError } from '../utils/HttpError.js';
import type { Ingredient, OptionSet } from '../types.js';

const OPTION_IDS = new Set(OPTIONS.map((o) => o.id));

/** Client list of option ids -> Set. Unknown ids are rejected; vegan implies no milk/egg. */
export function normalizeOptions(list: readonly string[] = []): { opts: OptionSet; error?: undefined } | { opts?: undefined; error: string } {
  const unknown = list.filter((id) => !OPTION_IDS.has(id));
  if (unknown.length) return { error: `Unknown dietary option: ${unknown.join(', ')}` };
  const opts: OptionSet = new Set(list);
  if (opts.has('vegan')) { opts.add('no_milk'); opts.add('no_egg'); }
  return { opts };
}

/** Same as normalizeOptions but throws a 400 instead of returning an error. */
export function parseOptions(list: readonly string[] = []): OptionSet {
  const r = normalizeOptions(list);
  if (r.error !== undefined) throw new HttpError(400, 'invalid_options', r.error);
  return r.opts;
}

/** Why an ingredient is not allowed under the chosen options, or null if it is fine. */
export function lockReason(ing: Ingredient | undefined, opts: OptionSet): string | null {
  if (!ing) return null;
  const a = ing.allergens;
  if (opts.has('halal') && ing.halal === false) return ing.halalNote || 'Not halal.';
  if (opts.has('vegan') && ing.gelatin) return 'Contains animal gelatin, so it is not vegan.';
  if ((opts.has('no_milk') || opts.has('vegan')) && a.includes('milk')) return 'Contains milk.';
  if ((opts.has('no_egg') || opts.has('vegan')) && a.includes('egg')) return 'Contains egg.';
  if (opts.has('no_nuts') && (a.includes('peanut') || a.includes('tree_nut'))) return 'Contains peanuts.';
  if (opts.has('no_wheat') && a.includes('wheat')) return 'Contains wheat.';
  return null;
}

/** Whether a bakery stocks an ingredient (`only` limits an ingredient to some bakeries). */
export const stocked = (ing: Ingredient, bakeryId?: string): boolean =>
  !ing.only || !bakeryId || ing.only.includes(bakeryId);
