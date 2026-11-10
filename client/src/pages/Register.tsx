import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Alert, Field, PasswordRules, useForm } from '../components';

export function Register() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [done, setDone] = useState<string | null>(null);
  const [mismatch, setMismatch] = useState(false);
  const { submitting, error, fieldErrors, handle } = useForm();
  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = handle(async () => {
    setMismatch(form.password !== form.confirm);
    if (form.password !== form.confirm) return;
    const { confirm: _, ...input } = form;
    setDone((await api.register(input)).message);
  });

  if (done) {
    return (
      <div className="card">
        <h1>Check your inbox</h1>
        <Alert kind="success">{done}</Alert>
        <p className="muted">The confirmation link expires in 24 hours.</p>
        <p className="muted">
          Can't find it? Check your <strong>spam or junk</strong> folder, and mark it <strong>Not spam</strong> so future emails reach your inbox.
        </p>
        <Link to="/login">Go to sign in</Link>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h1>Create your account</h1>
      {error && <Alert kind="error">{error}</Alert>}
      <div className="row">
        <Field label="First name" value={form.firstName} onChange={set('firstName')} autoComplete="given-name" required errors={fieldErrors.firstName} />
        <Field label="Last name" value={form.lastName} onChange={set('lastName')} autoComplete="family-name" required errors={fieldErrors.lastName} />
      </div>
      <Field label="Email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required errors={fieldErrors.email} />
      <Field label="Password" type="password" value={form.password} onChange={set('password')} autoComplete="new-password" required errors={fieldErrors.password} />
      <PasswordRules password={form.password} />
      <Field
        label="Confirm password"
        type="password"
        value={form.confirm}
        onChange={set('confirm')}
        autoComplete="new-password"
        required
        errors={mismatch ? ['Passwords do not match'] : undefined}
      />
      <button disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
      <p className="muted">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </form>
  );
}
