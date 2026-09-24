import { EventEmitter } from 'node:events';

/** In-process pub/sub for order changes; SSE controllers subscribe to it. */
export function createOrderEvents() {
  const em = new EventEmitter();
  em.setMaxListeners(0);
  return {
    publish: (order) => em.emit('order', order),
    subscribe(fn) {
      em.on('order', fn);
      return () => em.off('order', fn);
    },
  };
}
