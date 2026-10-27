import { Link } from 'react-router-dom';

export function SendGift() {
  return (
    <div className="card center">
      <h1>Gifting is coming soon</h1>
      <p className="muted">You're all set up. Sending gift cards isn't available yet — we'll let you know when it is.</p>
      <Link to="/account" className="btn btn-primary" style={{ alignSelf: 'center', color: '#fff' }}>
        Go to my account
      </Link>
    </div>
  );
}
