import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { HttpError } from '../http/errors.js';
import { requestMeta } from '../http/requestMeta.js';
import { passwordAttemptLimiter } from '../security/rateLimits.js';
import { encryptField } from '../security/fieldCrypto.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import { revokeAllSessions } from '../sessions/sessions.js';
import { recentEvents, recordEvent } from '../audit/audit.js';
import { assertStrongPassword } from '../auth/service.js';
import { name, password } from '../auth/schemas.js';
import { publicUser } from './publicUser.js';

const updateProfileSchema = z.object({
  firstName: name.optional(),
  lastName: name.optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{7,20}$/, 'Enter a valid phone number')
    .nullable()
    .optional()
    .or(z.literal('').transform(() => null)),
});

const changePasswordSchema = z.object({ currentPassword: password, newPassword: password });

// Mounted behind requireAuth, so req.auth is always set here.
export const accountRouter = Router();

accountRouter.get('/', (req, res) => {
  res.json({ user: publicUser(req.auth!.user) });
});

accountRouter.patch('/', async (req, res) => {
  const { firstName, lastName, phone } = updateProfileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.auth!.user.id },
    data: {
      firstName,
      lastName,
      ...(phone !== undefined && { phoneEncrypted: phone === null ? null : encryptField(phone) }),
    },
  });
  await recordEvent(user, 'PROFILE_UPDATED', requestMeta(req));
  res.json({ user: publicUser(user) });
});

accountRouter.post('/change-password', passwordAttemptLimiter, async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const { user, session } = req.auth!;

  if (!(await verifyPassword(user.passwordHash, currentPassword))) {
    throw new HttpError(400, 'Current password is incorrect', { currentPassword: ['Current password is incorrect'] });
  }
  if (currentPassword === newPassword) {
    throw new HttpError(400, 'Choose a password you are not already using', { newPassword: ['Must differ from your current password'] });
  }
  assertStrongPassword(newPassword, user);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() },
  });
  await revokeAllSessions(user.id, session.id); // sign out every other device
  await recordEvent(user, 'PASSWORD_CHANGED', requestMeta(req));
  res.json({ message: 'Password changed. Other devices have been signed out.' });
});

accountRouter.get('/activity', async (req, res) => {
  res.json({ events: await recentEvents(req.auth!.user.id) });
});
