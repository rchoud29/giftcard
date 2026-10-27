import type { Response } from 'express';
import type { Session, User } from '@prisma/client';
import { prisma } from '../db.js';
import { isProduction } from '../config.js';
import { generateToken, hashToken } from '../security/tokens.js';
import type { RequestMeta } from '../http/requestMeta.js';

export const SESSION_COOKIE = 'sid';
const ABSOLUTE_TIMEOUT_MS = 7 * 24 * 60 * 60_000;
const IDLE_TIMEOUT_MS = 30 * 60_000;
const TOUCH_INTERVAL_MS = 60_000; // avoid a DB write on every request

export async function createSession(res: Response, userId: string, meta: RequestMeta): Promise<void> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + ABSOLUTE_TIMEOUT_MS);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt, ip: meta.ip, userAgent: meta.userAgent },
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true, // not readable from JavaScript (XSS can't steal it)
    secure: isProduction, // HTTPS only in production
    sameSite: 'strict', // never sent on cross-site requests (CSRF)
    path: '/',
    expires: expiresAt,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, secure: isProduction, sameSite: 'strict', path: '/' });
}

/** Returns the session and its user, or null if the token is unknown, expired, or idle too long. */
export async function loadSession(token: string): Promise<{ session: Session; user: User } | null> {
  const found = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!found) return null;

  const now = Date.now();
  if (found.expiresAt.getTime() <= now || found.lastSeenAt.getTime() + IDLE_TIMEOUT_MS <= now) {
    await prisma.session.deleteMany({ where: { id: found.id } });
    return null;
  }
  if (now - found.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await prisma.session.update({ where: { id: found.id }, data: { lastSeenAt: new Date(now) } });
  }
  const { user, ...session } = found;
  return { session, user };
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

/** Signs the user out everywhere, optionally keeping the current session. */
export async function revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId, ...(exceptSessionId && { id: { not: exceptSessionId } }) },
  });
}
