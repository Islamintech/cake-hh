import { Bakery } from '../models/Bakery.js';
import { ORDER_STATUSES } from '../models/catalog.js';
import { HttpError } from '../utils/HttpError.js';
import { openSse } from '../utils/sse.js';
import { bakeryOrderView, orderListView } from '../views/orderView.js';
import { staffView } from '../views/bakeryView.js';

/** Which bakery's orders this request may see. Admin may narrow with ?bakeryId=. */
function scopeOf(req) {
  if (req.actor.role === 'bakery') return req.actor.bakeryId;
  const id = req.query.bakeryId;
  if (id && !Bakery.findById(id)) throw HttpError.badRequest('Unknown bakeryId.');
  return id || null;
}

const canSee = (actor, order) => actor.role === 'admin' || order.bakery_id === actor.bakeryId;
const actorLabel = (actor) => (actor.role === 'admin' ? 'admin' : `bakery:${actor.bakeryId}`);

/** Bakery staff endpoints. All routes sit behind requireBakery, so req.actor is set. */
export function createDashboardController({ Order, events }) {
  const findVisibleOrFail = (req) => {
    const o = Order.findByCode(req.params.code);
    // Another bakery's order gets the same 404 as a missing one.
    if (!o || !canSee(req.actor, o)) throw HttpError.notFound('Order not found.');
    return o;
  };

  return {
    // GET /api/bakery/me
    me(req, res) {
      res.json(staffView(req.actor));
    },

    // GET /api/bakery/orders?status=a,b&limit=&before=&bakeryId=
    index(req, res) {
      const status = req.query.status ? String(req.query.status).split(',').filter(Boolean) : undefined;
      if (status?.some((s) => !ORDER_STATUSES.includes(s))) throw HttpError.badRequest('Unknown status filter.');
      const limit = Math.min(Math.max(Number(req.query.limit) || 40, 1), 200);
      const before = req.query.before ? Number(req.query.before) : undefined;
      const orders = Order.list({ bakeryId: scopeOf(req), status, limit, before });
      res.set('Cache-Control', 'no-store');
      res.json(orderListView(orders, limit));
    },

    // GET /api/bakery/orders/:code
    show(req, res) {
      res.json({ order: bakeryOrderView(findVisibleOrFail(req)) });
    },

    // POST /api/bakery/orders/:code/status
    updateStatus(req, res) {
      const { status, photoUrl } = req.body;
      const saved = Order.transition(findVisibleOrFail(req), status, { photoUrl, actor: actorLabel(req.actor) });
      events.publish(saved);
      res.json({ order: bakeryOrderView(saved) });
    },

    // GET /api/bakery/stream  (Server-Sent Events)
    stream(req, res) {
      const bakeryId = scopeOf(req);
      let unsubscribe = () => {};
      const send = openSse(req, res, () => unsubscribe());
      send('snapshot', Order.list({ bakeryId, limit: 40 }).map(bakeryOrderView));
      unsubscribe = events.subscribe((o) => {
        if (!bakeryId || o.bakery_id === bakeryId) send('order', bakeryOrderView(o));
      });
    },
  };
}
