import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Alert, Field, PasswordRules, useForm } from '../components';

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const { setUser } = useAuth();
  const { submitting, error, fieldErrors, handle } = useForm();

  const submit = handle(async () => {
    setMismatch(password !== confirm);
    if (password !== confirm) return;
    setDone((await api.resetPassword(token, password)).message);
    setUser(null); // all sessions were revoked server-side
  });

  if (!token) {
    return (
      <div className="card">
        <h1>Reset your password</h1>
        <Alert kind="error">This reset link is incomplete.</Alert>
        <Link to="/forgot-password">Request a new link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card">
        <h1>Password updated</h1>
        <Alert kind="success">{done}</Alert>
        <Link to="/login">Sign in</Link>
      </div>
    );
  }

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h1>Choose a new password</h1>
      {error && (
        <Alert kind="error">
          {error} {!fieldErrors.password && <Link to="/forgot-password">Request a new link</Link>}
        </Alert>
      )}
      <Field label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required errors={fieldErrors.password} />
      <PasswordRules password={password} />
      <Field
        label="Confirm new password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
        errors={mismatch ? ['Passwords do not match'] : undefined}
      />
      <button disabled={submitting}>{submitting ? 'Saving…' : 'Set new password'}</button>
      <p className="muted">For your security, you'll be signed out of all devices.</p>
    </form>
  );
}
