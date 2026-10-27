import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

const common = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please wait a few minutes and try again.' },
  skip: () => config.NODE_ENV === 'test',
};

/** Per-IP limit on password checks (login, change password). Per-account lockout is in auth/service.ts. */
export const passwordAttemptLimiter = rateLimit({ ...common, windowMs: 15 * 60_000, limit: 20 });

/** Per-IP limit on endpoints that send email, to prevent mail bombing. */
export const emailSendLimiter = rateLimit({ ...common, windowMs: 60 * 60_000, limit: 10 });
