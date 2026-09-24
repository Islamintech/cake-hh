// Typed client for the backend API.
import type {
  Bakery, BakeryDetail, CakeDesign, Catalog, Order, OrderStatus, PlaceOrderBody, Quote, Staff, SuggestResponse,
} from './types';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/$/, '');

/** An error response from the API: `{ error: { code, message, details? } }`. */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, init: RequestInit & { key?: string } = {}): Promise<T> {
  const { key, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(API_URL + path, {
      ...rest,
      headers: {
        ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(0, 'network', "Can't reach the kitchen server. Is the backend running?");
  }
  const body: unknown = res.headers.get('content-type')?.includes('json') ? await res.json() : null;
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? 'http_error', err?.message ?? `Request failed (${res.status}).`, err?.details);
  }
  return body as T;
}

const qsOptions = (options: string[]) => (options.length ? `?options=${encodeURIComponent(options.join(','))}` : '');
const post = (body: unknown) => ({ method: 'POST', body: JSON.stringify(body) });

export const api = {
  catalog: () => request<Catalog>('/api/catalog'),

  bakeries: (options: string[], all = false) =>
    request<{ options: string[]; bakeries: Bakery[] }>(`/api/bakeries${qsOptions(options)}${all ? (options.length ? '&' : '?') + 'all=true' : ''}`),

  bakery: (id: string, options: string[]) => request<BakeryDetail>(`/api/bakeries/${encodeURIComponent(id)}${qsOptions(options)}`),

  quote: (bakeryId: string, cake: CakeDesign, options: string[]) => request<Quote>('/api/quote', post({ bakeryId, cake, options })),

  suggest: (body: { occasion: string | null; cravings: string[]; sweet: number | null; text: string; options: string[] }) =>
    request<SuggestResponse>('/api/ai/suggest', post(body)),

  partner: (body: { company: string; location: string; reason: string; products: string; contact: string }) =>
    request<{ application: { id: string; company: string; createdAt: number } }>('/api/partners', post(body)),

  placeOrder: (body: PlaceOrderBody) => request<{ order: Order; trackingToken: string }>('/api/orders', post(body)),

  trackOrder: (code: string, token: string) =>
    request<{ order: Order }>(`/api/orders/${encodeURIComponent(code)}`, { headers: { 'X-Tracking-Token': token } }),

  // ---- bakery dashboard ----
  staff: (key: string) => request<Staff>('/api/bakery/me', { key }),

  bakeryOrders: (key: string) => request<{ orders: Order[]; nextBefore: number | null }>('/api/bakery/orders?limit=40', { key }),

  setStatus: (key: string, code: string, status: OrderStatus) =>
    request<{ order: Order }>(`/api/bakery/orders/${encodeURIComponent(code)}/status`, { key, ...post({ status }) }),
};

// ---- Live updates (Server-Sent Events) ----

/** Follow one order. Returns a function that closes the stream. */
export function watchOrder(code: string, token: string, onOrder: (o: Order) => void, onError?: () => void): () => void {
  const es = new EventSource(`${API_URL}/api/orders/${encodeURIComponent(code)}/stream?token=${encodeURIComponent(token)}`);
  es.addEventListener('order', (e) => onOrder(JSON.parse((e as MessageEvent<string>).data) as Order));
  if (onError) es.onerror = onError;
  return () => es.close();
}

/** Bakery dashboard feed: a snapshot, then every new or changed order. */
export function watchBakeryOrders(key: string, handlers: { snapshot: (list: Order[]) => void; order: (o: Order) => void; error?: () => void }): () => void {
  const es = new EventSource(`${API_URL}/api/bakery/stream?key=${encodeURIComponent(key)}`);
  es.addEventListener('snapshot', (e) => handlers.snapshot(JSON.parse((e as MessageEvent<string>).data) as Order[]));
  es.addEventListener('order', (e) => handlers.order(JSON.parse((e as MessageEvent<string>).data) as Order));
  if (handlers.error) es.onerror = handlers.error;
  return () => es.close();
}
