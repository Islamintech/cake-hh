import crypto from 'node:crypto';

const digest = (s: string) => crypto.createHash('sha256').update(s).digest();

/** Constant-time string comparison (hashing first makes lengths equal). */
export const safeEqual = (a: string, b: string): boolean => crypto.timingSafeEqual(digest(a), digest(b));

export const tokenMatches = (given: unknown, expected: string): boolean =>
  typeof given === 'string' && given.length > 0 && safeEqual(given, expected);

// Unambiguous alphabet (no 0/O/1/I) for codes people read aloud over the phone.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomCode(len = 6): string {
  const bytes = crypto.randomBytes(len);
  let s = '';
  for (const byte of bytes) s += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  return 'CK-' + s;
}

export const randomToken = (): string => crypto.randomBytes(18).toString('base64url');
