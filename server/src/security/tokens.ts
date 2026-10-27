import { createHash, randomBytes } from 'node:crypto';

/** 256-bit random token, URL-safe. Used for session cookies and email links. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Tokens are stored only as SHA-256 hashes, so a database leak can't be replayed. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
