# eGift by Appyyo: Account System Base

This is the account and security foundation of the platform. It covers user stories #8, #9 and #10: sign up, sign in, keeping accounts secure, and resetting a forgotten password.

- **Server:** Express 5, TypeScript, Prisma, PostgreSQL. The code is in `server/`.
- **Client:** React, Vite, React Router, styled with the eGift design (light and dark themes). The code is in `client/`.

## What's included

- The eGift landing page at `/`. Its **Sign in** and **Get started** buttons open the real sign-in and sign-up pages.
- Sign up, with a confirmation email. **You can't sign in until you've confirmed your email.** A sign-in attempt on an unconfirmed account offers to resend the link.
- Sign in, sign out, forgot and reset password.
- An account page: edit your profile, change your password, and see your recent security activity.
- `/send-gift` is a "coming soon" placeholder for signed-in users. Gift card features aren't built yet.

The landing page's brand names, "40+ brands" and "$0 hidden fees" are placeholder copy from the design mock-up.

## Running locally

1. Start PostgreSQL. Either run `docker compose up -d` (this also starts Mailpit), or install Postgres 16 yourself and create a `giftcard` user and database. The default `DATABASE_URL` is `postgresql://giftcard:giftcard@localhost:5432/giftcard`.
2. Install the dependencies by running `npm install` in the repo root.
3. Configure the server:
   ```sh
   cp server/.env.example server/.env
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Paste the key that second command prints into `DATA_ENCRYPTION_KEY`, and set `DATABASE_URL` to point at your Postgres.
4. Create the tables by running `npm run db:migrate -w server`.
5. Start the app by running `npm run dev:server` and `npm run dev:client` in two separate terminals. Then open http://localhost:5173.

## Email

Sign-up needs a confirmation email, so emails matter: nobody can sign in until they've used the link. `MAIL_TRANSPORT` in `server/.env` picks how emails go out:

| Value | What happens |
|---|---|
| `console` (default) | Emails are printed in the server console. Copy the `/verify-email?token=...` or `/reset-password?token=...` link from there. Good for quick local testing. |
| `smtp` | Emails are sent through the SMTP server in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` and `SMTP_PASS`. With Docker, Mailpit catches them at http://localhost:8025. |

**Sending real emails with Gmail:** turn on 2-Step Verification, create an App Password at https://myaccount.google.com/apppasswords, then set:
```
MAIL_TRANSPORT=smtp
MAIL_FROM="eGift <you@gmail.com>"
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=you@gmail.com
SMTP_PASS=<the 16-character App Password>
```
Gmail limits sending to about 500 emails a day and shows your Gmail address as the sender, so use a transactional email provider for production. If an email never arrives, look for "Failed to send email" in the server log, because send failures are logged but not shown to the user.

## How each risk is mitigated

| Risk | Mitigation | Where |
|---|---|---|
| **1. Accounts hacked** | Passwords must be at least 12 characters, mix lowercase, uppercase and numbers, avoid common passwords and must not contain the user's name or email | `server/src/security/password.ts` |
| | Passwords are hashed with argon2id, using OWASP's recommended parameters | same file |
| | An account locks for 15 minutes after 5 failed logins, and the owner gets an email | `server/src/auth/service.ts` |
| | Requests are rate-limited per IP on login and on every endpoint that sends email | `server/src/security/rateLimits.ts` |
| | New accounts can't sign in until the emailed confirmation link is used | `auth/service.ts` |
| | Login errors are generic and take the same time either way, so they don't reveal which accounts exist | `auth/service.ts` |
| | Sessions are stored on the server. The cookie is `HttpOnly`, `Secure` and `SameSite=Strict`, and holds a random token that the database stores only as a hash. Sessions expire after 30 minutes idle or 7 days total | `server/src/sessions/` |
| | Cross-origin requests that change data are blocked, as a second CSRF defence | `server/src/security/sameOrigin.ts` |
| **2. Data exposed** | Personal fields (phone) are encrypted with AES-256-GCM before they're stored | `server/src/security/fieldCrypto.ts` |
| | Session and email tokens are stored only as hashes, and password hashes never leave the server | `sessions/`, `auth/emailTokens.ts`, `account/publicUser.ts` |
| | In production, HTTP redirects to HTTPS, and helmet adds HSTS and other security headers | `server/src/app.ts` |
| **3. Forgotten password** | Reset links are single-use, expire after 30 minutes, are stored hashed, and asking for a new link cancels the old one | `auth/emailTokens.ts` |
| | A reset signs the user out of every device, unlocks the account and emails the owner | `auth/service.ts` |
| | The forgot-password response is the same whether or not the email has an account | `auth/routes.ts` |


## API

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | `{email, password, firstName, lastName}` returns 202 and sends a verification email |
| POST | `/api/auth/login` | `{email, password}` sets the session cookie. Returns 403 until the email is confirmed |
| POST | `/api/auth/logout` | revokes the current session |
| GET | `/api/auth/me` | the signed-in user |
| POST | `/api/auth/verify-email` | `{token}` |
| POST | `/api/auth/resend-verification` | `{email}` always returns 202, and only sends mail to unconfirmed accounts |
| POST | `/api/auth/forgot-password` | `{email}` always returns 202 |
| POST | `/api/auth/reset-password` | `{token, password}` |
| GET / PATCH | `/api/account` | view or update `{firstName, lastName, phone}` |
| POST | `/api/account/change-password` | `{currentPassword, newPassword}` signs out the user's other devices |
| GET | `/api/account/activity` | the 20 most recent security events |
