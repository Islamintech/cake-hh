import type { Request, Response } from 'express';
import { prepareNewOrder, type OrderModel } from '../models/Order.js';
import { orderView, placedOrderView } from '../views/orderView.js';
import { openSse } from '../utils/sse.js';
import type { OrderEvents } from '../types.js';
import type { OrderBody } from '../validators/schemas.js';

type CodeReq = Request<{ code: string }>;

const trackingToken = (req: Request): unknown => req.get('x-tracking-token') ?? req.query.token;

/** Customer-facing order endpoints. */
export function createOrderController({ Order, events }: { Order: OrderModel; events: OrderEvents }) {
  return {
    // POST /api/orders  (body validated by orderSchema)
    create(req: Request, res: Response) {
      const saved = Order.create(prepareNewOrder(req.body as OrderBody));
      events.publish(saved);
      // SMS sending would go here; for now the tracking link is returned to the client.
      res.status(201)
        .location(`/api/orders/${saved.code}?token=${saved.tracking_token}`)
        .json(placedOrderView(saved));
    },

    // GET /api/orders/:code?token=...
    show(req: CodeReq, res: Response) {
      const order = Order.findForCustomerOrFail(req.params.code, trackingToken(req));
      res.set('Cache-Control', 'no-store');
      res.json({ order: orderView(order) });
    },

    // GET /api/orders/:code/stream?token=...  (Server-Sent Events)
    stream(req: CodeReq, res: Response) {
      const order = Order.findForCustomerOrFail(req.params.code, trackingToken(req));
      let unsubscribe = () => {};
      const send = openSse(req, res, () => unsubscribe());
      send('order', orderView(order));
      unsubscribe = events.subscribe((changed) => {
        if (changed.id === order.id) send('order', orderView(changed));
      });
    },
  };
}
