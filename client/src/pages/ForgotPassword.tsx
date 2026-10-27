import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Alert, Field, useForm } from '../components';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<string | null>(null);
  const { submitting, error, fieldErrors, handle } = useForm();

  const submit = handle(async () => {
    setSent((await api.forgotPassword(email)).message);
  });

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h1>Reset your password</h1>
      {sent ? (
        <>
          <Alert kind="success">{sent}</Alert>
          <p className="muted">The link expires in 30 minutes and works once.</p>
        </>
      ) : (
        <>
          <p className="muted">Enter the email you signed up with and we'll send you a reset link.</p>
          {error && <Alert kind="error">{error}</Alert>}
          <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required errors={fieldErrors.email} />
          <button disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</button>
        </>
      )}
      <p className="muted">
        <Link to="/login">Back to sign in</Link>
      </p>
    </form>
  );
}
