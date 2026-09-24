export const won = (n: number): string => '₩' + (Math.round(n / 100) * 100).toLocaleString('en-US');

/** Escape text for use inside SVG/HTML strings. */
export const esc = (s: unknown): string =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
