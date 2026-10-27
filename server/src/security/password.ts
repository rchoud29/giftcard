import argon2 from 'argon2';

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

// Small starter list; swap in a large breached-password list (e.g. top 100k) for production.
const COMMON_PASSWORDS = new Set([
  'password1234', 'password12345', 'password123!', 'passw0rd1234', 'qwertyuiop12', 'qwerty123456',
  '123456789012', '1234567890ab', 'iloveyou1234', 'letmein12345', 'welcome12345', 'admin1234567',
  'giftcard1234', 'giftcards123', 'abc123456789', 'changeme1234', 'football1234', 'monkey123456',
]);

export interface PasswordContext {
  email?: string;
  firstName?: string;
  lastName?: string;
}

/** Returns a list of human-readable problems; empty means the password is acceptable. */
export function checkPasswordPolicy(password: string, ctx: PasswordContext = {}): string[] {
  const errors: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) errors.push(`Must be at least ${PASSWORD_MIN_LENGTH} characters`);
  if (password.length > PASSWORD_MAX_LENGTH) errors.push(`Must be at most ${PASSWORD_MAX_LENGTH} characters`);
  if (!/[a-z]/.test(password)) errors.push('Must contain a lowercase letter');
  if (!/[A-Z]/.test(password)) errors.push('Must contain an uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain a number');

  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) errors.push('This password is too common');

  const personal = [ctx.email?.split('@')[0], ctx.firstName, ctx.lastName]
    .map((v) => v?.trim().toLowerCase())
    .filter((v): v is string => !!v && v.length >= 3);
  if (personal.some((v) => lower.includes(v))) errors.push('Must not contain your name or email');

  return errors;
}

// OWASP-recommended argon2id parameters (19 MiB memory, 2 iterations).
const ARGON2_OPTIONS = { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

let dummyHash: Promise<string> | undefined;

/** Burns the same CPU time as a real check, so "no such user" isn't detectable by timing. */
export async function verifyAgainstDummy(password: string): Promise<void> {
  dummyHash ??= hashPassword('dummy-password-for-timing');
  await verifyPassword(await dummyHash, password);
}
