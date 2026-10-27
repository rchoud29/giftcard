import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { ApiError } from './api';

export function Field({
  label,
  errors,
  ...input
}: { label: string; errors?: string[] } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...input} aria-invalid={errors?.length ? true : undefined} />
      {errors?.map((e) => (
        <small key={e} className="error">
          {e}
        </small>
      ))}
    </label>
  );
}

export function Alert({ kind, children }: { kind: 'error' | 'success' | 'info'; children: ReactNode }) {
  return (
    <div className={`alert alert-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

// Mirrors the server rules in server/src/security/password.ts for instant feedback.
// The server remains the source of truth.
const RULES: [string, (p: string) => boolean][] = [
  ['At least 12 characters', (p) => p.length >= 12],
  ['A lowercase letter', (p) => /[a-z]/.test(p)],
  ['An uppercase letter', (p) => /[A-Z]/.test(p)],
  ['A number', (p) => /[0-9]/.test(p)],
];

export function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="rules">
      {RULES.map(([label, test]) => (
        <li key={label} className={test(password) ? 'ok' : ''}>
          {test(password) ? '✓' : '○'} {label}
        </li>
      ))}
    </ul>
  );
}

/** Handles submit state and maps API errors to a message plus per-field errors. */
export function useForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function handle(action: () => Promise<void>) {
    return async (e: FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      setError(null);
      setFieldErrors({});
      try {
        await action();
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
          setFieldErrors(err.details ?? {});
        } else {
          setError('Could not reach the server. Check your connection and try again.');
        }
      } finally {
        setSubmitting(false);
      }
    };
  }

  return { submitting, error, fieldErrors, handle };
}
