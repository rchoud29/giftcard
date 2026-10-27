import type { RequestHandler } from 'express';
import { HttpError } from '../http/errors.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * CSRF defense in depth (the session cookie is already SameSite=Strict):
 * reject state-changing requests whose Origin header is another site.
 */
export function requireSameOrigin(allowedOrigin: string): RequestHandler {
  return (req, _res, next) => {
    const origin = req.get('origin');
    if (SAFE_METHODS.has(req.method) || !origin || origin === allowedOrigin) return next();
    next(new HttpError(403, 'Cross-site request blocked'));
  };
}
