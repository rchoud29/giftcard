import { useEffect, useState } from 'react';
import { api, type SecurityEvent } from '../api';
import { useAuth } from '../auth';
import { Alert, Field, PasswordRules, useForm } from '../components';

const EVENT_LABELS: Record<string, string> = {
  REGISTERED: 'Account created',
  LOGIN_SUCCESS: 'Signed in',
  LOGIN_FAILED: 'Failed sign-in attempt',
  ACCOUNT_LOCKED: 'Account locked after failed attempts',
  EMAIL_VERIFIED: 'Email confirmed',
  PASSWORD_CHANGED: 'Password changed',
  PASSWORD_RESET_REQUESTED: 'Password reset requested',
  PASSWORD_RESET: 'Password reset',
  PROFILE_UPDATED: 'Profile updated',
};

export function Account() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="stack">
      <Profile />
      <ChangePassword />
      <Activity />
    </div>
  );
}

function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ firstName: user!.firstName, lastName: user!.lastName, phone: user!.phone ?? '' });
  const [saved, setSaved] = useState(false);
  const { submitting, error, fieldErrors, handle } = useForm();

  const submit = handle(async () => {
    setSaved(false);
    setUser((await api.updateProfile({ ...form, phone: form.phone || null })).user);
    setSaved(true);
  });

  return (
    <form className="card wide" onSubmit={submit} noValidate>
      <h2>Profile</h2>
      {error && <Alert kind="error">{error}</Alert>}
      {saved && <Alert kind="success">Profile saved.</Alert>}
      <Field label="Email" value={user!.email} disabled />
      <div className="row">
        <Field label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} errors={fieldErrors.firstName} />
        <Field label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} errors={fieldErrors.lastName} />
      </div>
      <Field label="Phone (optional, stored encrypted)" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" errors={fieldErrors.phone} />
      <button disabled={submitting}>{submitting ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

function ChangePassword() {
  const [currentPassword, setCurrent] = useState('');
  const [newPassword, setNew] = useState('');
  const [done, setDone] = useState<string | null>(null);
  const { submitting, error, fieldErrors, handle } = useForm();

  const submit = handle(async () => {
    setDone(null);
    setDone((await api.changePassword(currentPassword, newPassword)).message);
    setCurrent('');
    setNew('');
  });

  return (
    <form className="card wide" onSubmit={submit} noValidate>
      <h2>Change password</h2>
      {error && <Alert kind="error">{error}</Alert>}
      {done && <Alert kind="success">{done}</Alert>}
      <Field label="Current password" type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" errors={fieldErrors.currentPassword} />
      <Field label="New password" type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} autoComplete="new-password" errors={fieldErrors.newPassword ?? fieldErrors.password} />
      <PasswordRules password={newPassword} />
      <button disabled={submitting}>{submitting ? 'Updating…' : 'Change password'}</button>
    </form>
  );
}

function Activity() {
  const [events, setEvents] = useState<SecurityEvent[] | null>(null);
  useEffect(() => {
    api.activity().then((r) => setEvents(r.events), () => setEvents([]));
  }, []);

  return (
    <section className="card wide">
      <h2>Recent security activity</h2>
      <p className="muted">Don't recognize something? Change your password right away.</p>
      {events === null ? (
        <p className="muted">Loading…</p>
      ) : (
        <ul className="activity">
          {events.map((e, i) => (
            <li key={i}>
              <strong>{EVENT_LABELS[e.type] ?? e.type}</strong>
              <span className="muted">
                {new Date(e.createdAt).toLocaleString()} · {e.ip ?? 'unknown IP'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
