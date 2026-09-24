import { Bakery } from '../models/Bakery.js';
import { describeCake } from '../models/Cake.js';
import { nextStatuses, stepsFor, PHOTO_STATUSES, type Step } from '../models/Order.js';
import type { CakeDesign, CakeStats, Customer, OrderEvent, OrderRecord, OrderStatus, TasteProfile } from '../types.js';

export interface OrderView {
  id: string;
  code: string;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
  bakeryId: string;
  bakeryName: string;
  cake: CakeDesign;
  description: string[];
  options: string[];
  customer: Customer;
  date: string;
  time: string;
  subtotal: number;
  discount: number;
  total: number;
  currency: 'KRW';
  stats: CakeStats;
  tasteProfile?: TasteProfile;
  photo: boolean;
  photoUrl: string | null;
  steps: Step[];
  history?: OrderEvent[];
  /** Bakery views only: the buttons the dashboard should show. */
  nextStatuses?: OrderStatus[];
}

/**
 * API shape of an order. Field names match what the demo frontend already reads
 * (id = code, bakeryName, customer.mode/addr, photo flag, ...). The tracking token is never included.
 */
export function orderView(o: OrderRecord, { forBakery = false } = {}): OrderView {
  const view: OrderView = {
    id: o.code,
    code: o.code,
    status: o.status,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    bakeryId: o.bakery_id,
    bakeryName: Bakery.findById(o.bakery_id)?.name ?? o.bakery_id,
    cake: o.cake,
    description: describeCake(o.cake),
    options: o.options,
    customer: o.customer,
    date: o.date,
    time: o.time,
    subtotal: o.subtotal,
    discount: o.discount,
    total: o.total,
    currency: 'KRW',
    stats: o.stats,
    tasteProfile: o.taste_profile ?? undefined,
    photo: !!o.photo_url || PHOTO_STATUSES.has(o.status),
    photoUrl: o.photo_url ?? null,
    steps: stepsFor(o.customer.mode),
    history: o.history,
  };
  if (forBakery) view.nextStatuses = nextStatuses(o.status, o.customer.mode);
  return view;
}

export const bakeryOrderView = (o: OrderRecord): OrderView => orderView(o, { forBakery: true });

/** Response right after checkout: the one time the tracking token is handed out. */
export const placedOrderView = (o: OrderRecord) => ({ order: orderView(o), trackingToken: o.tracking_token });

export function orderListView(orders: OrderRecord[], limit: number) {
  return {
    orders: orders.map(bakeryOrderView),
    nextBefore: orders.length === limit ? orders[orders.length - 1]!.created_at : null,
  };
}
