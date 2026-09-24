import { TIMEZONE } from '../models/catalog.js';

// Dates in Korea time: bakeries and customers are in Seoul. ISO dates (YYYY-MM-DD) compare correctly as strings.
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export const seoulToday = (now: Date = new Date()): string => fmt.format(now);

export function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function isRealDate(iso: string): boolean {
  const d = new Date(iso + 'T00:00:00Z');
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === iso;
}
