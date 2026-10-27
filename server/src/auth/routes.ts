import { Router } from 'express';
import { requestMeta } from '../http/requestMeta.js';
import { HttpError } from '../http/errors.js';
import { emailSendLimiter, passwordAttemptLimiter } from '../security/rateLimits.js';
import { clearSessionCookie, revokeSession } from '../sessions/sessions.js';
import { publicUser } from '../account/publicUser.js';
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, tokenSchema } from './schemas.js';
import * as auth from './service.js';

export const authRouter = Router();

authRouter.post('/register', emailSendLimiter, async (req, res) => {
  await auth.register(registerSchema.parse(req.body), requestMeta(req));
  res.status(202).json({ message: 'Check your email to confirm your account.' });
});

authRouter.post('/login', passwordAttemptLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await auth.login(res, email, password, requestMeta(req));
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', async (req, res) => {
  if (req.auth) await revokeSession(req.auth.session.id);
  clearSessionCookie(res);
  res.status(204).end();
});

authRouter.get('/me', (req, res) => {
  if (!req.auth) throw new HttpError(401, 'Please sign in');
  res.json({ user: publicUser(req.auth.user) });
});

authRouter.post('/verify-email', async (req, res) => {
  await auth.verifyEmail(tokenSchema.parse(req.body).token, requestMeta(req));
  res.json({ message: 'Email confirmed.' });
});

authRouter.post('/resend-verification', emailSendLimiter, async (req, res) => {
  await auth.resendVerification(emailSchema.parse(req.body).email);
  res.status(202).json({ message: 'If your email is not yet confirmed, a new link is on its way.' });
});

authRouter.post('/forgot-password', emailSendLimiter, async (req, res) => {
  await auth.forgotPassword(emailSchema.parse(req.body).email, requestMeta(req));
  res.status(202).json({ message: 'If an account exists for that email, a reset link is on its way.' });
});

authRouter.post('/reset-password', passwordAttemptLimiter, async (req, res) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await auth.resetPassword(token, password, requestMeta(req));
  res.json({ message: 'Password updated. Please sign in with your new password.' });
});
