import type { Response } from 'express';
import { Prisma, type User } from '@prisma/client';
import { prisma } from '../db.js';
import { config } from '../config.js';
import { HttpError } from '../http/errors.js';
import type { RequestMeta } from '../http/requestMeta.js';
import { checkPasswordPolicy, hashPassword, verifyAgainstDummy, verifyPassword, type PasswordContext } from '../security/password.js';
import { createSession, revokeAllSessions } from '../sessions/sessions.js';
import { recordEvent } from '../audit/audit.js';
import { sendMail } from '../mail/mailer.js';
import * as templates from '../mail/templates.js';
import { findValidEmailToken, issueEmailToken, markEmailTokenUsed } from './emailTokens.js';

export const MAX_FAILED_LOGINS = 5;
export const LOCKOUT_MS = 15 * 60_000;

const INVALID_CREDENTIALS = () => new HttpError(401, 'Incorrect email or password');
const INVALID_LINK = () => new HttpError(400, 'This link is invalid or has expired. Please request a new one.');

export function assertStrongPassword(password: string, ctx: PasswordContext): void {
  const problems = checkPasswordPolicy(password, ctx);
  if (problems.length) throw new HttpError(400, 'Password does not meet the requirements', { password: problems });
}

export async function sendVerificationEmail(user: Pick<User, 'id' | 'email' | 'firstName'>): Promise<void> {
  const token = await issueEmailToken(user.id, 'VERIFY_EMAIL');
  const link = `${config.APP_URL}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail({ to: user.email, ...templates.verifyEmail(user.firstName, link) });
}

/**
 * Responds the same way whether or not the email is already registered,
 * so the signup form can't be used to discover who has an account.
 */
export async function register(
  input: { email: string; password: string; firstName: string; lastName: string },
  meta: RequestMeta,
): Promise<void> {
  assertStrongPassword(input.password, input);
  const passwordHash = await hashPassword(input.password); // hash first: equal timing for new and existing emails

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    await sendMail({ to: existing.email, ...templates.alreadyRegistered(existing.firstName) });
    return;
  }

  let user: User;
  try {
    user = await prisma.user.create({
      data: { email: input.email, passwordHash, firstName: input.firstName, lastName: input.lastName },
    });
  } catch (err) {
    // Lost a race with a concurrent signup for the same email
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return;
    throw err;
  }
  await recordEvent(user, 'REGISTERED', meta);
  await sendVerificationEmail(user);
}

export async function login(res: Response, email: string, password: string, meta: RequestMeta): Promise<User> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    await verifyAgainstDummy(password);
    throw INVALID_CREDENTIALS();
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw new HttpError(423, 'Too many failed attempts. Try again in 15 minutes or reset your password.');
  }

  if (!(await verifyPassword(user.passwordHash, password))) {
    // Atomic increment so parallel guesses can't slip past the limit
    const { failedLoginCount } = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: { increment: 1 } },
      select: { failedLoginCount: true },
    });
    if (failedLoginCount >= MAX_FAILED_LOGINS) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) },
      });
      await recordEvent(user, 'ACCOUNT_LOCKED', meta);
      throw new HttpError(423, 'Too many failed attempts. Try again in 15 minutes or reset your password.');
    }
    await recordEvent(user, 'LOGIN_FAILED', meta);
    throw INVALID_CREDENTIALS();
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null },
  });
  // Only reached with the right password, so this doesn't reveal which emails have accounts
  if (!updated.emailVerifiedAt) {
    throw new HttpError(403, 'Please confirm your email address before signing in. Check your inbox for the link.');
  }
  await createSession(res, user.id, meta);
  await recordEvent(user, 'LOGIN_SUCCESS', meta);
  return updated;
}

/** Always succeeds from the caller's point of view (no account enumeration). */
export async function resendVerification(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerifiedAt) await sendVerificationEmail(user);
}

export async function verifyEmail(token: string, meta: RequestMeta): Promise<void> {
  const record = await findValidEmailToken(token, 'VERIFY_EMAIL');
  if (!record || !(await markEmailTokenUsed(record.id))) throw INVALID_LINK();
  const user = await prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
  await recordEvent(user, 'EMAIL_VERIFIED', meta);
}

/** Always succeeds from the caller's point of view (no account enumeration). */
export async function forgotPassword(email: string, meta: RequestMeta): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;
  const token = await issueEmailToken(user.id, 'RESET_PASSWORD');
  const link = `${config.APP_URL}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail({ to: user.email, ...templates.resetPassword(user.firstName, link) });
  await recordEvent(user, 'PASSWORD_RESET_REQUESTED', meta);
}

export async function resetPassword(token: string, newPassword: string, meta: RequestMeta): Promise<void> {
  const record = await findValidEmailToken(token, 'RESET_PASSWORD');
  if (!record) throw INVALID_LINK();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: record.userId } });

  // Check the policy before using up the token, so a weak password doesn't burn the link
  assertStrongPassword(newPassword, user);
  const passwordHash = await hashPassword(newPassword);
  if (!(await markEmailTokenUsed(record.id))) throw INVALID_LINK();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordChangedAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null,
      // Receiving the link proves control of the inbox
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
    },
  });
  await revokeAllSessions(user.id);
  await recordEvent(user, 'PASSWORD_RESET', meta);
}
