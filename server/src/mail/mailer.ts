import nodemailer, { type Transporter } from 'nodemailer';
import { config } from '../config.js';

export interface Mail {
  to: string;
  subject: string;
  text: string;
}

/** Messages captured when MAIL_TRANSPORT=memory (used by tests). */
export const outbox: Mail[] = [];

let transporter: Transporter | undefined;

function smtp(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASS } : undefined,
  });
  return transporter;
}

/**
 * Never throws: a mail outage must not change API responses
 * (which would also leak whether an email address is registered).
 */
export async function sendMail(mail: Mail): Promise<void> {
  try {
    if (config.MAIL_TRANSPORT === 'memory') {
      outbox.push(mail);
    } else if (config.MAIL_TRANSPORT === 'console') {
      console.log(`\n--- email ---\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n-------------\n`);
    } else {
      await smtp().sendMail({ from: config.MAIL_FROM, ...mail });
    }
  } catch (err) {
    console.error('Failed to send email', err);
  }
}
