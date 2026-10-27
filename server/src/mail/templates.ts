import { config } from '../config.js';

type Template = { subject: string; text: string };

const SIGNATURE = '\n\n— The Gift Cards team';
const NOT_YOU = `If this wasn't you, reset your password now: ${config.APP_URL}/forgot-password`;

export function verifyEmail(firstName: string, link: string): Template {
  return {
    subject: 'Confirm your email address',
    text: `Hi ${firstName},\n\nConfirm your email address to start managing your gift cards:\n${link}\n\nThis link expires in 24 hours.${SIGNATURE}`,
  };
}

export function alreadyRegistered(firstName: string): Template {
  return {
    subject: 'Someone tried to create an account with your email',
    text: `Hi ${firstName},\n\nSomeone tried to sign up using this email address, but you already have an account.\nIf you forgot your password, reset it here: ${config.APP_URL}/forgot-password\n\nIf this wasn't you, you can ignore this email.${SIGNATURE}`,
  };
}

export function resetPassword(firstName: string, link: string): Template {
  return {
    subject: 'Reset your password',
    text: `Hi ${firstName},\n\nWe received a request to reset your password. Use this link to choose a new one:\n${link}\n\nThis link expires in 30 minutes and can only be used once. If you didn't ask for this, ignore this email — your password won't change.${SIGNATURE}`,
  };
}

export function passwordChanged(firstName: string): Template {
  return {
    subject: 'Your password was changed',
    text: `Hi ${firstName},\n\nThe password for your account was just changed, and other devices were signed out.\n\n${NOT_YOU}${SIGNATURE}`,
  };
}

export function accountLocked(firstName: string): Template {
  return {
    subject: 'Your account was temporarily locked',
    text: `Hi ${firstName},\n\nWe locked your account for 15 minutes after several failed sign-in attempts.\n\n${NOT_YOU}${SIGNATURE}`,
  };
}
