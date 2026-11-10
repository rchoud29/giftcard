import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Alert, Field, useForm } from '../components';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [resent, setResent] = useState<string | null>(null);
  const { submitting, error, fieldErrors, handle } = useForm();
  const resendForm = useForm();
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

  const submit = handle(async () => {
    setUnconfirmed(false);
    setResent(null);
    try {
      setUser((await api.login(email, password)).user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setUnconfirmed(true);
      throw err;
    }
    navigate(from, { replace: true });
  });

  const resend = resendForm.handle(async () => setResent((await api.resendVerification(email)).message));

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h1>Sign in</h1>
      {error && <Alert kind="error">{error}</Alert>}
      {unconfirmed && (
        <Alert kind="info">
          {resent ? (
            resent
          ) : (
            <>
              Didn't get the email? Check your <strong>spam or junk</strong> folder, or{' '}
              <button type="button" className="link" disabled={resendForm.submitting} onClick={resend}>
                resend the confirmation email
              </button>
              .
            </>
          )}
          {resendForm.error && <div className="error">{resendForm.error}</div>}
        </Alert>
      )}
      <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required errors={fieldErrors.email} />
      <Field
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        errors={fieldErrors.password}
      />
      <button disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      <p className="muted">
        <Link to="/forgot-password">Forgot your password?</Link>
        <br />
        New here? <Link to="/register">Create an account</Link>
      </p>
    </form>
  );
}
