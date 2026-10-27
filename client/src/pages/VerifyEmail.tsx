import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';
import { Alert } from '../components';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const { refresh } = useAuth();
  const [state, setState] = useState<{ kind: 'info' | 'success' | 'error'; text: string }>({
    kind: 'info',
    text: 'Confirming your email…',
  });
  const started = useRef(false); // the token is single-use: don't submit twice in StrictMode

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = params.get('token');
    if (!token) {
      setState({ kind: 'error', text: 'This link is missing its token.' });
      return;
    }
    api
      .verifyEmail(token)
      .then(async (r) => {
        setState({ kind: 'success', text: r.message });
        await refresh();
      })
      .catch((err) => setState({ kind: 'error', text: err instanceof ApiError ? err.message : 'Could not reach the server.' }));
  }, [params, refresh]);

  return (
    <div className="card">
      <h1>Email confirmation</h1>
      <Alert kind={state.kind}>{state.text}</Alert>
      <Link to="/account">Go to your account</Link>
    </div>
  );
}
