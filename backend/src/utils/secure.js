import crypto from 'node:crypto';

const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();

/** Constant-time string comparison (hashing first makes lengths equal). */
export const safeEqual = (a, b) => crypto.timingSafeEqual(digest(a), digest(b));

export const tokenMatches = (given, expected) => typeof given === 'string' && given.length > 0 && safeEqual(given, expected);

// Unambiguous alphabet (no 0/O/1/I) for codes people read aloud over the phone.
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomCode(len = 6) {
  const bytes = crypto.randomBytes(len);
  let s = '';
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return 'CK-' + s;
}

export const randomToken = () => crypto.randomBytes(18).toString('base64url');
