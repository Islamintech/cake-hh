// Orders placed from this browser, so the tracking link survives closing the tab (no accounts).
const KEY = 'ck-my-orders';

export interface MyOrder { code: string; token: string; at: number }

export function myOrders(): MyOrder[] {
  try {
    const list: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? (list as MyOrder[]) : [];
  } catch {
    return [];
  }
}

export function rememberOrder(code: string, token: string): void {
  try {
    const list = [{ code, token, at: Date.now() }, ...myOrders().filter((o) => o.code !== code)].slice(0, 20);
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: the link in the URL still works */
  }
}

export const tokenFor = (code: string): string | null => myOrders().find((o) => o.code === code)?.token ?? null;
