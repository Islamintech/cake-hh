import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL } from '../src/models/catalog.js';
import { Bakery } from '../src/models/Bakery.js';
import { normalizeOptions, lockReason } from '../src/models/DietaryOptions.js';
import { validateCake, pricing, statsOf } from '../src/models/Cake.js';
import { nextStatuses } from '../src/models/Order.js';
import { localSuggest, sanitizeSuggestions, createSuggester, type ModelCaller } from '../src/services/suggestionService.js';
import type { CakeDesign } from '../src/types.js';

const opts = (...ids: string[]) => normalizeOptions(ids).opts!;
// Tests feed deliberately loose/invalid designs, so the helper is untyped input cast to CakeDesign.
const cake = (over: Record<string, unknown> = {}): CakeDesign => ({
  shape: 'round', size: 'm', lettering: '',
  layers: [{ batter: 'vanilla', frosting: 'whip', toppings: [{ id: 'straw', fx: 0, fy: 0 }] }],
  ...over,
}) as CakeDesign;
const bk = (id: string) => Bakery.findById(id)!;

test('vegan implies no milk and no egg; unknown options rejected', () => {
  const o = opts('vegan');
  assert.ok(o.has('no_milk') && o.has('no_egg'));
  assert.match(normalizeOptions(['gluten_free']).error!, /Unknown/);
});

test('lock reasons follow fixed allergen/halal rules', () => {
  assert.match(lockReason(ALL.rum, opts('halal'))!, /rum/);
  assert.match(lockReason(ALL.gummy, opts('vegan'))!, /gelatin/);
  assert.equal(lockReason(ALL.peanut, opts('no_nuts')), 'Contains peanuts.');
  assert.equal(lockReason(ALL.rice, opts('no_wheat')), null);
  assert.equal(lockReason(ALL.vanilla, opts()), null);
});

test('bakery fit: halal excludes s3, vegan excludes s3 (no vegan batter there)', () => {
  assert.equal(Bakery.fits(bk('s3'), opts('halal')), false);
  assert.equal(Bakery.fits(bk('s3'), opts('vegan')), false);
  assert.equal(Bakery.fits(bk('s1'), opts('vegan')), true);
});

test('pricing matches the demo formula', () => {
  const c = cake({ layers: [{ batter: 'vanilla', frosting: 'whip', toppings: ['straw', 'straw', 'straw', 'straw', 'mint'].map((id) => ({ id })) }] });
  assert.deepEqual(pricing(c, bk('s1')), { subtotal: 45500, discount: 4600, total: 40900, currency: 'KRW' });
  // extra layer + lettering + bakery multiplier
  const c2 = cake({ lettering: 'Hi', layers: [{ batter: 'chocolate', frosting: 'ganache', toppings: [] }, { batter: 'vanilla', frosting: 'whip', toppings: [] }] });
  // 39000 + 3000 + 3000 + 15000 + 2000 = 62000 * 1.05 = 65100
  assert.equal(pricing(c2, bk('s3')).subtotal, 65100);
});

test('validateCake rejects unstocked, locked, unknown and over-limit designs', () => {
  const s3 = bk('s3');
  assert.match(validateCake(cake({ layers: [{ batter: 'oat', frosting: 'whip', toppings: [] }] }), s3, opts()).errors![0]!, /doesn't offer/);
  assert.match(validateCake(cake(), bk('s1'), opts('no_milk')).errors!.join(' '), /Contains milk/);
  assert.match(validateCake(cake({ shape: 'star' }), s3, opts()).errors![0]!, /shape/);
  assert.match(validateCake(cake({ layers: [{ batter: 'nope', frosting: 'whip' }] }), s3, opts()).errors![0]!, /unknown batter/);
  const three = Array(3).fill({ batter: 'vanilla', frosting: 'whip', toppings: [] });
  assert.match(validateCake(cake({ layers: three }), bk('s2'), opts()).errors![0]!, /up to 2 layers/);
  const tooMany = Array(13).fill({ id: 'mint' });
  assert.match(validateCake(cake({ layers: [{ batter: 'vanilla', frosting: 'whip', toppings: tooMany }] }), s3, opts()).errors![0]!, /at most 12/);
  assert.match(validateCake(cake({ lettering: 'x'.repeat(19) }), s3, opts()).errors![0]!, /at most 18/);
});

test('validateCake normalizes: clamps positions, strips markup, marks baked', () => {
  const v = validateCake(cake({ lettering: ' <b>Hi</b> ', layers: [{ batter: 'vanilla', frosting: 'whip', toppings: [{ id: 'straw', fx: 9, fy: 'x' }], baked: false }] }), bk('s1'), opts());
  assert.equal(v.errors, undefined);
  assert.equal(v.cake!.lettering, 'bHi/b');
  assert.deepEqual(v.cake!.layers[0]!.toppings[0]!, { id: 'straw', fx: 1, fy: 0 });
  assert.equal(v.cake!.layers[0]!.baked, true);
});

test('stats flag combos and low sugar goal', () => {
  const s = statsOf(cake({ layers: [{ batter: 'redvelvet', frosting: 'cheese', toppings: [] }] }), opts());
  assert.equal(s.taste, true);
  const bad = statsOf(cake({ layers: [{ batter: 'vanilla', frosting: 'whip', toppings: [{ id: 'kiwi' }] }] }), opts());
  assert.equal(bad.taste, false);
});

test('status machine differs for pickup and delivery', () => {
  assert.deepEqual(nextStatuses('received', 'pickup'), ['accepted', 'declined']);
  assert.deepEqual(nextStatuses('ready', 'pickup'), ['pickedup']);
  assert.deepEqual(nextStatuses('ready', 'delivery'), ['delivering']);
  assert.deepEqual(nextStatuses('delivered', 'delivery'), []);
});

test('local suggestions never include locked ingredients', () => {
  for (const o of [opts('vegan'), opts('halal', 'no_nuts'), opts('no_wheat')]) {
    const out = localSuggest({ cravings: ['nutty', 'creamy'], sweet: 2 }, o);
    assert.ok(out.length > 0);
    for (const s of out) for (const id of [s.batter, s.frosting, ...s.toppings]) assert.equal(lockReason(ALL[id], o), null, id);
  }
});

test('AI output is re-checked: locked/unknown/misplaced ids are dropped', () => {
  const out = sanitizeSuggestions([
    { name: 'A', reason: 'r', batter: 'vanilla', frosting: 'coconut', toppings: ['straw'] }, // vanilla has milk
    { name: 'B', reason: 'r', batter: 'oat', frosting: 'coconut', toppings: ['cookie', 'straw', 'bogus'] },
    { name: 'C', reason: 'r', batter: 'straw', frosting: 'coconut', toppings: [] }, // topping used as batter
  ], opts('vegan'));
  assert.equal(out.length, 1);
  assert.deepEqual(out[0]!.toppings, ['straw']);
});

test('Claude path: sends enum-constrained schema, sanitizes output, falls back on refusal/error', async () => {
  const silent = { warn() {}, error() {} };
  const cfg = { anthropicApiKey: '', anthropicModel: 'claude-opus-5', aiTimeoutMs: 1000 };
  let sent: Parameters<ModelCaller>[0] | undefined;
  const reply = (stop_reason: 'end_turn' | 'refusal', text: string) =>
    ({ stop_reason, content: [{ type: 'text', text, citations: null }] }) as unknown as Awaited<ReturnType<ModelCaller>>;
  const fake = (res: Awaited<ReturnType<ModelCaller>> | Error): ModelCaller => async (body) => {
    sent = body;
    if (res instanceof Error) throw res;
    return res;
  };
  type SchemaShape = { schema: { properties: { suggestions: { items: { properties: Record<string, { enum?: string[]; items?: { enum?: string[] } }> } } } } };
  const json = JSON.stringify({ suggestions: [
    { name: 'Oat Dream', reason: 'Light and fruity.', batter: 'oat', frosting: 'coconut', toppings: ['straw', 'cookie'] },
    { name: 'Sneaky', reason: 'x', batter: 'vanilla', frosting: 'coconut', toppings: [] },
  ] });

  const input = { occasion: null, cravings: ['fruity'], sweet: null, text: 'hi' };
  const ok = await createSuggester(cfg, silent, fake(reply('end_turn', json))).suggest(input, opts('vegan'));
  assert.equal(ok.source, 'ai');
  assert.deepEqual(ok.suggestions.map((s) => s.name), ['Oat Dream']);
  assert.deepEqual(ok.suggestions[0]!.toppings, ['straw']);
  assert.equal(sent!.fallbacks, 'default');
  const item = (sent!.output_config!.format as unknown as SchemaShape).schema.properties.suggestions.items.properties;
  assert.deepEqual(item.batter!.enum, ['oat']);
  assert.ok(!item.toppings!.items!.enum!.includes('cookie'));
  assert.match(String(sent!.messages[0]!.content), /<customer_note>hi<\/customer_note>/);

  for (const res of [reply('refusal', ''), reply('end_turn', 'not json'), new Error('network down')]) {
    const r = await createSuggester(cfg, silent, fake(res)).suggest({ ...input, cravings: [] }, opts());
    assert.equal(r.source, 'local');
    assert.equal(r.suggestions.length, 3);
  }
});
