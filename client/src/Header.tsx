import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './auth';

type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => (document.documentElement.getAttribute('data-theme') as Theme | null) ?? systemTheme());

  useEffect(() => {
    try {
      const saved = localStorage.getItem('egift-theme');
      if (saved === 'light' || saved === 'dark') {
        document.documentElement.setAttribute('data-theme', saved);
        setTheme(saved);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    try {
      localStorage.setItem('egift-theme', next);
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        {theme === 'dark' ? (
          <path d="M12 3v2M12 19v2M5 5l1.5 1.5M17.5 17.5L19 19M3 12h2M19 12h2M5 19l1.5-1.5M17.5 6.5L19 5M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export function Logo() {
  return (
    <span className="logo" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 12v7a1 1 0 01-1 1H5a1 1 0 01-1-1v-7M12 20V8M12 8H8.5a2.5 2.5 0 010-5C11 3 12 8 12 8zM12 8h3.5a2.5 2.5 0 000-5C13 3 12 8 12 8zM3 8h18v4H3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const onLanding = useLocation().pathname === '/';

  return (
    <nav className="nav">
      <div className="wrap nav-in">
        <Link to="/" className="brand">
          <Logo />
          <span>
            eGift<small>by appyyo</small>
          </span>
        </Link>
        {onLanding && (
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#group">Group gifting</a>
            <a href="#redeem">Redemption</a>
            <a href="#wallet">Wallet</a>
          </div>
        )}
        <div className="nav-cta">
          <ThemeToggle />
          {user ? (
            <>
              <span className="nav-hello">Hi, {user.firstName}</span>
              <Link to="/account" className="btn btn-ghost">
                Account
              </Link>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
