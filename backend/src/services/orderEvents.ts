import { EventEmitter } from 'node:events';
import type { OrderEvents, OrderRecord } from '../types.js';

/** In-process pub/sub for order changes; SSE controllers subscribe to it. */
export function createOrderEvents(): OrderEvents {
  const em = new EventEmitter();
  em.setMaxListeners(0);
  return {
    publish: (order) => { em.emit('order', order); },
    subscribe(fn: (order: OrderRecord) => void) {
      em.on('order', fn);
      return () => { em.off('order', fn); };
    },
  };
}
