import { z } from 'zod';
import { PASSWORD_MAX_LENGTH } from '../security/password.js';

export const email = z.string().trim().toLowerCase().email('Enter a valid email address').max(254);
export const name = z.string().trim().min(1, 'Required').max(100);
// Strength rules live in checkPasswordPolicy; this only bounds the input size before hashing.
export const password = z.string().min(1, 'Required').max(PASSWORD_MAX_LENGTH);

export const registerSchema = z.object({ email, password, firstName: name, lastName: name });
export const loginSchema = z.object({ email, password });
export const emailSchema = z.object({ email });
export const tokenSchema = z.object({ token: z.string().min(1).max(200) });
export const resetPasswordSchema = z.object({ token: z.string().min(1).max(200), password });
