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

// ---- Status machine (mirrors the bakery dashboard's buttons) ----

export function nextStatuses(status, mode) {
  const delivery = mode === 'delivery';
  return ({
    received: ['accepted', 'declined'],
    accepted: ['baking'],
    baking: ['ready'],
    ready: delivery ? ['delivering'] : ['pickedup'],
    delivering: ['delivered'],
  })[status] || [];
}

export const stepsFor = (mode) => (mode === 'delivery' ? STEPS_DELIVERY : STEPS_PICKUP)
  .map(([id, label]) => ({ id, label }));

export const PHOTO_STATUSES = new Set(['ready', 'delivering', 'delivered', 'pickedup']);

/** Throw unless `order` may move to `status` (optionally attaching a photo). */
export function assertTransition(order, status, photoUrl) {
  const allowed = nextStatuses(order.status, order.customer.mode);
  if (!allowed.includes(status)) {
    throw HttpError.conflict('invalid_transition', `Can't go from "${order.status}" to "${status}".`, { current: order.status, allowed });
  }
  if (photoUrl && status !== 'ready') throw HttpError.badRequest('A photo can only be attached when marking the cake ready.');
}

// ---- Placing an order ----

/**
 * Apply every business rule to a (schema-valid) order request and return the fields to store.
 * The price is computed here; anything price-like the client sent is ignored.
 */
export function prepareNewOrder(input, today = seoulToday()) {
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
    taste_profile: input.tasteProfile || null,
  };
}

// ---- Persistence ----

const JSON_COLS = ['cake', 'options', 'customer', 'stats', 'taste_profile'];

function fromRow(row) {
  if (!row) return null;
  const o = { ...row };
  for (const c of JSON_COLS) o[c] = o[c] == null ? null : JSON.parse(o[c]);
  return o;
}

function toRow(order) {
  const row = { ...order };
  for (const c of JSON_COLS) row[c] = row[c] == null ? null : JSON.stringify(row[c]);
  return row;
}

/** Order repository bound to a database connection. */
export function createOrderModel(db) {
  const st = {
    insert: db.prepare(`INSERT INTO orders (id, code, tracking_token, bakery_id, status, cake, options, customer, date, time,
      subtotal, discount, total, stats, taste_profile, photo_url, created_at, updated_at)
      VALUES (@id, @code, @tracking_token, @bakery_id, @status, @cake, @options, @customer, @date, @time,
      @subtotal, @discount, @total, @stats, @taste_profile, @photo_url, @created_at, @updated_at)`),
    event: db.prepare('INSERT INTO order_events (order_id, status, actor, at) VALUES (?, ?, ?, ?)'),
    byCode: db.prepare('SELECT * FROM orders WHERE code = ?'),
    events: db.prepare('SELECT status, actor, at FROM order_events WHERE order_id = ? ORDER BY at, id'),
    setStatus: db.prepare('UPDATE orders SET status = ?, photo_url = COALESCE(?, photo_url), updated_at = ? WHERE id = ? AND status = ?'),
  };

  const insertTx = db.transaction((row) => {
    st.insert.run(row);
    st.event.run(row.id, row.status, 'customer', row.created_at);
  });

  // Compare-and-set: only applies if the order is still in `from`.
  const transitionTx = db.transaction((id, from, to, photoUrl, actor, at) => {
    const r = st.setStatus.run(to, photoUrl ?? null, at, id, from);
    if (r.changes !== 1) return false;
    st.event.run(id, to, actor, at);
    return true;
  });

  const Order = {
    /** Store a prepared order. Returns the saved order including its secret tracking token. */
    create(fields) {
      const now = Date.now();
      for (let attempt = 0; attempt < 5; attempt++) {
        const order = {
          id: crypto.randomUUID(), code: randomCode(), tracking_token: randomToken(),
          status: 'received', photo_url: null, created_at: now, updated_at: now, ...fields,
        };
        try {
          insertTx(toRow(order));
          return Order.findByCode(order.code);
        } catch (e) {
          if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' || e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') continue;
          throw e;
        }
      }
      throw new Error('Could not generate a unique order code.');
    },

    findByCode(code) {
      const o = fromRow(st.byCode.get(String(code).toUpperCase()));
      if (o) o.history = st.events.all(o.id);
      return o;
    },

    /** Customer lookup. A wrong token looks exactly like a missing order so codes can't be probed. */
    findForCustomerOrFail(code, token) {
      const o = Order.findByCode(code);
      if (!o || !tokenMatches(token, o.tracking_token)) throw HttpError.notFound('Order not found.');
      return o;
    },

    list({ bakeryId, status, limit = 50, before } = {}) {
      const where = [];
      const args = {};
      if (bakeryId) { where.push('bakery_id = @bakeryId'); args.bakeryId = bakeryId; }
      if (status?.length) {
        where.push(`status IN (${status.map((_, i) => '@s' + i).join(',')})`);
        status.forEach((s, i) => { args['s' + i] = s; });
      }
      if (before) { where.push('created_at < @before'); args.before = before; }
      const sql = `SELECT * FROM orders ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT @limit`;
      return db.prepare(sql).all({ ...args, limit }).map(fromRow);
    },

    /** Validate and apply a status change. Returns the updated order. */
    transition(order, status, { photoUrl, actor }) {
      assertTransition(order, status, photoUrl);
      if (!transitionTx(order.id, order.status, status, photoUrl, actor, Date.now())) {
        throw HttpError.conflict('conflict', 'This order was just updated by someone else. Refresh and try again.');
      }
      return Order.findByCode(order.code);
    },
  };
  return Order;
}
