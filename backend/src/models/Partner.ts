// Bakeries asking to join: stored for the team to review. No login, so nothing here is trusted.
import crypto from 'node:crypto';
import { cleanText } from '../utils/text.js';
import type { DB } from './database.js';
import type { PartnerBody } from '../validators/schemas.js';

export interface PartnerRecord {
  id: string;
  company: string;
  location: string;
  reason: string;
  products: string;
  contact: string;
  created_at: number;
}

export interface PartnerModel {
  create(input: PartnerBody): PartnerRecord;
  list(limit?: number): PartnerRecord[];
}

export function createPartnerModel(db: DB): PartnerModel {
  const q = {
    insert: db.prepare<[string, string, string, string, string, string, number]>(
      'INSERT INTO partner_applications (id, company, location, reason, products, contact, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'),
    list: db.prepare<[number], PartnerRecord>('SELECT * FROM partner_applications ORDER BY created_at DESC LIMIT ?'),
  };
  return {
    create(input) {
      const rec: PartnerRecord = {
        id: crypto.randomUUID(),
        company: cleanText(input.company, 80),
        location: cleanText(input.location, 120),
        reason: cleanText(input.reason, 600),
        products: cleanText(input.products, 600),
        contact: cleanText(input.contact, 160),
        created_at: Date.now(),
      };
      q.insert.run(rec.id, rec.company, rec.location, rec.reason, rec.products, rec.contact, rec.created_at);
      return rec;
    },
    list: (limit = 50) => q.list.all(limit),
  };
}
