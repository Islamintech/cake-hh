// Strip control characters and angle brackets; this text ends up printed on a real cake or a bakery ticket.
export const cleanText = (s: unknown, max: number): string =>
  String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, max);
