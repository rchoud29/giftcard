import type { SecurityEventType, User } from '@prisma/client';
import { prisma } from '../db.js';
import { sendMail } from '../mail/mailer.js';
import * as templates from '../mail/templates.js';
import type { RequestMeta } from '../http/requestMeta.js';

// Events that also trigger a security notification email to the account owner.
const ALERTS: Partial<Record<SecurityEventType, (firstName: string) => { subject: string; text: string }>> = {
  ACCOUNT_LOCKED: templates.accountLocked,
  PASSWORD_CHANGED: templates.passwordChanged,
  PASSWORD_RESET: templates.passwordChanged,
};

export async function recordEvent(
  user: Pick<User, 'id' | 'email' | 'firstName'>,
  type: SecurityEventType,
  meta: RequestMeta,
): Promise<void> {
  await prisma.securityEvent.create({ data: { userId: user.id, type, ip: meta.ip, userAgent: meta.userAgent } });
  const alert = ALERTS[type];
  if (alert) await sendMail({ to: user.email, ...alert(user.firstName) });
}

export async function recentEvents(userId: string, limit = 20) {
  return prisma.securityEvent.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { type: true, ip: true, userAgent: true, createdAt: true },
  });
}
