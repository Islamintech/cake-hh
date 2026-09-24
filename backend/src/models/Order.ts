// Guest cake orders: business rules for placing and progressing an order, plus persistence.
import crypto from 'node:crypto';
import { MAX_DAYS_AHEAD, STEPS_PICKUP, STEPS_DELIVERY } from './catalog.js';
import { Bakery } from './Bakery.js';
import { parseOptions } from './DietaryOptions.js';
import { validateCakeOrFail, quote } from './Cake.js';
import { HttpError } from '../utils/HttpError.js';
import { seoulToday, addDays, isRealDate } from '../utils/dates.js';
import { cleanText } from '../utils/text.js';
import { randomCode, randomToken, tokenMatches } from '../utils/secure.js';
import type { DB } from './database.js';
import type { FulfilmentMode, NewOrderFields, OrderEvent, OrderRecord, OrderStatus, TasteProfile } from '../types.js';

// ---- Status machine (mirrors the bakery dashboard's buttons) ----

export function nextStatuses(status: OrderStatus, mode: FulfilmentMode): OrderStatus[] {
  const flow: Partial<Record<OrderStatus, OrderStatus[]>> = {
    received: ['accepted', 'declined'],
    accepted: ['baking'],
    baking: ['ready'],
    ready: mode === 'delivery' ? ['delivering'] : ['pickedup'],
    delivering: ['delivered'],
  };
  return flow[status] ?? [];
}

export interface Step { id: OrderStatus; label: string }

export const stepsFor = (mode: FulfilmentMode): Step[] => (mode === 'delivery' ? STEPS_DELIVERY : STEPS_PICKUP)
  .map(([id, label]) => ({ id, label }));

export const PHOTO_STATUSES: ReadonlySet<OrderStatus> = new Set(['ready', 'delivering', 'delivered', 'pickedup']);

/** Throw unless `order` may move to `status` (optionally attaching a photo). */
export function assertTransition(order: OrderRecord, status: OrderStatus, photoUrl?: string): void {
  const allowed = nextStatuses(order.status, order.customer.mode);
  if (!allowed.includes(status)) {
    throw HttpError.conflict('invalid_transition', `Can't go from "${order.status}" to "${status}".`, { current: order.status, allowed });
  }
  if (photoUrl && status !== 'ready') throw HttpError.badRequest('A photo can only be attached when marking the cake ready.');
}

// ---- Placing an order ----

/** A structurally valid order request (see validators/schemas.ts). */
export interface NewOrderInput {
  bakeryId: string;
  cake: unknown;
  options: string[];
  customer: { name: string; phone: string; mode: FulfilmentMode; addr: string };
  date: string;
  time: string;
  tasteProfile?: TasteProfile;
}

/**
 * Apply every business rule to an order request and return the fields to store.
 * The price is computed here; anything price-like the client sent is ignored.
 */
export function prepareNewOrder(input: NewOrderInput, today: string = seoulToday()): NewOrderFields {
  const b = Bakery.findOrFail(input.bakeryId);
  const opts = parseOptions(input.options);
  Bakery.assertSuits(b, opts);
  const cake = validateCakeOrFail(input.cake, b, opts);

  const c = input.customer;
  if (c.mode === 'delivery' && !b.delivery) throw HttpError.unprocessable('delivery_unavailable', `${b.name} offers pickup only.`);
  if (c.mode === 'pickup' && !b.pickup) throw HttpError.unprocessable('pickup_unavailable', `${b.name} offers delivery only.`);
  if (c.mode === 'delivery' && !c.addr) throw HttpError.badRequest('Add a delivery address, or switch to pickup.');

  if (!isRealDate(input.date)) throw HttpError.badRequest('That date does not exist.');
  const earliest = Bakery.earliestDate(b, today);
  const latest = addDays(today, MAX_DAYS_AHEAD);
  if (input.date < earliest) throw HttpError.unprocessable('date_too_soon', `${b.name} needs until ${earliest} at the earliest.`, { earliest });
  if (input.date > latest) throw HttpError.unprocessable('date_too_far', `Orders can be placed up to ${MAX_DAYS_AHEAD} days ahead.`, { latest });

  const q = quote(cake, b, opts);
  return {
    bakery_id: b.id,
    cake,
    options: [...opts],
    customer: {
      name: cleanText(c.name, 40),
      phone: c.phone.replace(/\s+/g, ''),
      mode: c.mode,
      addr: c.mode === 'delivery' ? cleanText(c.addr, 200) : '',
    },
    date: input.date,
    time: input.time,
    subtotal: q.subtotal,
    discount: q.discount,
    total: q.total,
    stats: q.stats,
    taste_profile: input.tasteProfile ?? null,
  };
}

// ---- Persistence ----

const JSON_COLS = ['cake', 'options', 'customer', 'stats', 'taste_profile'] as const;

/** How a row comes back from SQLite: JSON columns are strings, and there is no history yet. */
type OrderRow = Omit<OrderRecord, (typeof JSON_COLS)[number] | 'history'> & Record<(typeof JSON_COLS)[number], string | null>;

/** `history` is only loaded for single-order reads; lists leave it out. */
function fromRow(row: OrderRow, history?: OrderEvent[]): OrderRecord {
  const parsed: Record<string, unknown> = { ...row, ...(history ? { history } : {}) };
  for (const c of JSON_COLS) parsed[c] = row[c] == null ? null : JSON.parse(row[c]);
  return parsed as unknown as OrderRecord;
}

function toRow(order: Omit<OrderRecord, 'history'>): Record<string, unknown> {
  const row: Record<string, unknown> = { ...order };
  for (const c of JSON_COLS) row[c] = order[c] == null ? null : JSON.stringify(order[c]);
  return row;
}

const isUniqueViolation = (e: unknown): boolean => {
  const code = (e as { code?: unknown })?.code;
  return code === 'SQLITE_CONSTRAINT_UNIQUE' || code === 'SQLITE_CONSTRAINT_PRIMARYKEY';
};

export interface ListQuery { bakeryId?: string | null; status?: OrderStatus[]; limit?: number; before?: number }

export interface OrderModel {
  create(fields: NewOrderFields): OrderRecord;
  findByCode(code: string): OrderRecord | null;
  findForCustomerOrFail(code: string, token: unknown): OrderRecord;
  list(q?: ListQuery): OrderRecord[];
  transition(order: OrderRecord, status: OrderStatus, meta: { photoUrl?: string; actor: string }): OrderRecord;
}

/** Order repository bound to a database connection. */
export function createOrderModel(db: DB): OrderModel {
  const st = {
    insert: db.prepare(`INSERT INTO orders (id, code, tracking_token, bakery_id, status, cake, options, customer, date, time,
      subtotal, discount, total, stats, taste_profile, photo_url, created_at, updated_at)
      VALUES (@id, @code, @tracking_token, @bakery_id, @status, @cake, @options, @customer, @date, @time,
      @subtotal, @discount, @total, @stats, @taste_profile, @photo_url, @created_at, @updated_at)`),
    event: db.prepare<[string, OrderStatus, string, number]>('INSERT INTO order_events (order_id, status, actor, at) VALUES (?, ?, ?, ?)'),
    byCode: db.prepare<[string], OrderRow>('SELECT * FROM orders WHERE code = ?'),
    events: db.prepare<[string], OrderEvent>('SELECT status, actor, at FROM order_events WHERE order_id = ? ORDER BY at, id'),
    setStatus: db.prepare<[OrderStatus, string | null, number, string, OrderStatus]>(
      'UPDATE orders SET status = ?, photo_url = COALESCE(?, photo_url), updated_at = ? WHERE id = ? AND status = ?'),
  };

  const insertTx = db.transaction((row: Record<string, unknown>) => {
    st.insert.run(row);
    st.event.run(row.id as string, row.status as OrderStatus, 'customer', row.created_at as number);
  });

  // Compare-and-set: only applies if the order is still in `from`.
  const transitionTx = db.transaction((id: string, from: OrderStatus, to: OrderStatus, photoUrl: string | null, actor: string, at: number) => {
    const r = st.setStatus.run(to, photoUrl, at, id, from);
    if (r.changes !== 1) return false;
    st.event.run(id, to, actor, at);
    return true;
  });

  const Order: OrderModel = {
    create(fields) {
      const now = Date.now();
      for (let attempt = 0; attempt < 5; attempt++) {
        const order = {
          id: crypto.randomUUID(), code: randomCode(), tracking_token: randomToken(),
          status: 'received' as const, photo_url: null, created_at: now, updated_at: now, ...fields,
        };
        try {
          insertTx(toRow(order));
          return Order.findByCode(order.code)!;
        } catch (e) {
          if (isUniqueViolation(e)) continue;
          throw e;
        }
      }
      throw new Error('Could not generate a unique order code.');
    },

    findByCode(code) {
      const row = st.byCode.get(String(code).toUpperCase());
      return row ? fromRow(row, st.events.all(row.id)) : null;
    },

    /** A wrong token looks exactly like a missing order so codes can't be probed. */
    findForCustomerOrFail(code, token) {
      const o = Order.findByCode(code);
      if (!o || !tokenMatches(token, o.tracking_token)) throw HttpError.notFound('Order not found.');
      return o;
    },

    list({ bakeryId, status, limit = 50, before } = {}) {
      const where: string[] = [];
      const args: Record<string, string | number> = { limit };
      if (bakeryId) { where.push('bakery_id = @bakeryId'); args.bakeryId = bakeryId; }
      if (status?.length) {
        where.push(`status IN (${status.map((_, i) => '@s' + i).join(',')})`);
        status.forEach((s, i) => { args['s' + i] = s; });
      }
      if (before) { where.push('created_at < @before'); args.before = before; }
      const sql = `SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT @limit`;
      return (db.prepare(sql).all(args) as OrderRow[]).map((r) => fromRow(r));
    },

    transition(order, status, { photoUrl, actor }) {
      assertTransition(order, status, photoUrl);
      if (!transitionTx(order.id, order.status, status, photoUrl ?? null, actor, Date.now())) {
        throw HttpError.conflict('conflict', 'This order was just updated by someone else. Refresh and try again.');
      }
      return Order.findByCode(order.code)!;
    },
  };
  return Order;
}
