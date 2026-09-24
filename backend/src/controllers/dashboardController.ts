import type { Request, Response } from 'express';
import { Bakery } from '../models/Bakery.js';
import { ORDER_STATUSES } from '../models/catalog.js';
import type { OrderModel } from '../models/Order.js';
import { actorOf } from '../middleware/auth.js';
import { HttpError } from '../utils/HttpError.js';
import { openSse } from '../utils/sse.js';
import { bakeryOrderView, orderListView } from '../views/orderView.js';
import { staffView } from '../views/bakeryView.js';
import type { Actor, OrderEvents, OrderRecord, OrderStatus } from '../types.js';
import type { StatusBody } from '../validators/schemas.js';

type CodeReq = Request<{ code: string }>;

const isStatus = (s: string): s is OrderStatus => (ORDER_STATUSES as readonly string[]).includes(s);

/** Which bakery's orders this request may see (null = all). Admin may narrow with ?bakeryId=. */
function scopeOf(req: Request): string | null {
  const actor = actorOf(req);
  if (actor.role === 'bakery') return actor.bakeryId;
  const id = typeof req.query.bakeryId === 'string' ? req.query.bakeryId : '';
  if (id && !Bakery.findById(id)) throw HttpError.badRequest('Unknown bakeryId.');
  return id || null;
}

const canSee = (actor: Actor, order: OrderRecord) => actor.role === 'admin' || order.bakery_id === actor.bakeryId;
const actorLabel = (actor: Actor) => (actor.role === 'admin' ? 'admin' : `bakery:${actor.bakeryId}`);

/** Bakery staff endpoints. All routes sit behind requireBakery, so req.actor is set. */
export function createDashboardController({ Order, events }: { Order: OrderModel; events: OrderEvents }) {
  const findVisibleOrFail = (req: CodeReq): OrderRecord => {
    const o = Order.findByCode(req.params.code);
    // Another bakery's order gets the same 404 as a missing one.
    if (!o || !canSee(actorOf(req), o)) throw HttpError.notFound('Order not found.');
    return o;
  };

  return {
    // GET /api/bakery/me
    me(req: Request, res: Response) {
      res.json(staffView(actorOf(req)));
    },

    // GET /api/bakery/orders?status=a,b&limit=&before=&bakeryId=
    index(req: Request, res: Response) {
      let status: OrderStatus[] | undefined;
      if (req.query.status) {
        const list = String(req.query.status).split(',').filter(Boolean);
        if (!list.every(isStatus)) throw HttpError.badRequest('Unknown status filter.');
        status = list;
      }
      const limit = Math.min(Math.max(Number(req.query.limit) || 40, 1), 200);
      const before = req.query.before ? Number(req.query.before) : undefined;
      const orders = Order.list({ bakeryId: scopeOf(req), status, limit, before });
      res.set('Cache-Control', 'no-store');
      res.json(orderListView(orders, limit));
    },

    // GET /api/bakery/orders/:code
    show(req: CodeReq, res: Response) {
      res.json({ order: bakeryOrderView(findVisibleOrFail(req)) });
    },

    // POST /api/bakery/orders/:code/status  (body validated by statusSchema)
    updateStatus(req: CodeReq, res: Response) {
      const { status, photoUrl } = req.body as StatusBody;
      const saved = Order.transition(findVisibleOrFail(req), status, { photoUrl, actor: actorLabel(actorOf(req)) });
      events.publish(saved);
      res.json({ order: bakeryOrderView(saved) });
    },

    // GET /api/bakery/stream  (Server-Sent Events)
    stream(req: Request, res: Response) {
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
