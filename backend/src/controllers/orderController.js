import { prepareNewOrder } from '../models/Order.js';
import { orderView, placedOrderView } from '../views/orderView.js';
import { openSse } from '../utils/sse.js';

const trackingToken = (req) => req.get('x-tracking-token') || req.query.token;

/** Customer-facing order endpoints. */
export function createOrderController({ Order, events }) {
  return {
    // POST /api/orders
    create(req, res) {
      const saved = Order.create(prepareNewOrder(req.body));
      events.publish(saved);
      // SMS sending would go here; for now the tracking link is returned to the client.
      res.status(201)
        .location(`/api/orders/${saved.code}?token=${saved.tracking_token}`)
        .json(placedOrderView(saved));
    },

    // GET /api/orders/:code?token=...
    show(req, res) {
      const order = Order.findForCustomerOrFail(req.params.code, trackingToken(req));
      res.set('Cache-Control', 'no-store');
      res.json({ order: orderView(order) });
    },

    // GET /api/orders/:code/stream?token=...  (Server-Sent Events)
    stream(req, res) {
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
