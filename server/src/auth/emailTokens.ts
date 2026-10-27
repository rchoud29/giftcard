import type { EmailToken, EmailTokenType } from '@prisma/client';
import { prisma } from '../db.js';
import { generateToken, hashToken } from '../security/tokens.js';

const TTL_MS: Record<EmailTokenType, number> = {
  VERIFY_EMAIL: 24 * 60 * 60_000,
  RESET_PASSWORD: 30 * 60_000,
};

/** Creates a single-use token and invalidates any earlier unused ones of the same type. */
export async function issueEmailToken(userId: string, type: EmailTokenType): Promise<string> {
  const token = generateToken();
  await prisma.$transaction([
    prisma.emailToken.deleteMany({ where: { userId, type, usedAt: null } }),
    prisma.emailToken.create({
      data: { userId, type, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + TTL_MS[type]) },
    }),
  ]);
  return token;
}

/** Looks up a token without using it up. */
export async function findValidEmailToken(token: string, type: EmailTokenType): Promise<EmailToken | null> {
  const record = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.type !== type || record.usedAt || record.expiresAt <= new Date()) return null;
  return record;
}

/** Atomically marks a token used. Returns false if another request already used it. */
export async function markEmailTokenUsed(id: string): Promise<boolean> {
  const { count } = await prisma.emailToken.updateMany({ where: { id, usedAt: null }, data: { usedAt: new Date() } });
  return count === 1;
}
