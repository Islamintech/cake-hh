// Request body shapes. These check structure only; business rules live in the models.
import { z } from 'zod';
import { OCCASIONS, CRAVINGS, TIME_SLOTS, ORDER_STATUSES } from '../models/catalog.js';

const optionList = z.array(z.string()).max(10).default([]);
const cravingList = z.array(z.enum(CRAVINGS.map((c) => c[0]))).max(6).default([]);
const sweetness = z.union([z.literal(1), z.literal(2), z.literal(3)]).nullish();

export const quoteSchema = z.object({
  bakeryId: z.string({ error: 'bakeryId is required.' }),
  cake: z.unknown(),
  options: optionList,
});

export const suggestionSchema = z.object({
  occasion: z.enum(OCCASIONS).nullish(),
  cravings: cravingList,
  sweet: sweetness,
  text: z.string().max(140, 'Keep the note under 140 characters.').default(''),
  options: optionList,
});

export const orderSchema = z.object({
  bakeryId: z.string({ error: 'bakeryId is required.' }),
  cake: z.unknown(),
  options: optionList,
  customer: z.object({
    name: z.string().trim().min(1, 'Add your name so the bakery knows whose cake it is.').max(40),
    phone: z.string().trim().regex(/^[0-9+\-\s]{9,15}$/, 'Add a phone number like 010-1234-5678. We text your tracking link there.'),
    mode: z.enum(['pickup', 'delivery']),
    addr: z.string().trim().max(200).optional().default(''),
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must look like 2026-09-30.'),
  time: z.enum(TIME_SLOTS),
  tasteProfile: z.object({
    occasion: z.enum(OCCASIONS).nullish(),
    cravings: cravingList,
    sweet: sweetness,
  }).optional(),
});

export const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  photoUrl: z.string().url().refine((u) => u.startsWith('https://'), 'photoUrl must be an https URL.').max(500).optional(),
});
