import type { User } from '@prisma/client';
import { decryptField } from '../security/fieldCrypto.js';

/** The only shape of a user that leaves the server. Never includes hashes or lockout state. */
export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phoneEncrypted ? decryptField(user.phoneEncrypted) : null,
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt,
  };
}
