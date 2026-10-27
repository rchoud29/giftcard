import type { RequestHandler } from 'express';
import type { Session, User } from '@prisma/client';
import { HttpError } from '../http/errors.js';
import { SESSION_COOKIE, clearSessionCookie, loadSession } from './sessions.js';

declare global {
  namespace Express {
    interface Request {
      auth?: { session: Session; user: User };
    }
  }
}

export const attachSession: RequestHandler = async (req, res, next) => {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token === 'string' && token) {
    const auth = await loadSession(token);
    if (auth) req.auth = auth;
    else clearSessionCookie(res);
  }
  next();
};

export const requireAuth: RequestHandler = (req, _res, next) => {
  next(req.auth ? undefined : new HttpError(401, 'Please sign in'));
};
