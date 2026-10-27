import { Link } from 'react-router-dom';
import { useAuth } from '../auth';
import { Logo } from '../Header';

function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function Landing() {
  const { user } = useAuth();
  const start = user ? '/send-gift' : '/register';

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">★ One wallet for every gift card</span>
            <h1>
              Give any card.
              <br />
              Keep it all in <em>one place.</em>
            </h1>
            <p className="lede">
              eGift is the universal digital gift card platform. Send to any retailer, pool with friends, add a personal message, and let them redeem however
              they want — all from a single wallet.
            </p>
            <div className="hero-actions">
              <Link to={start} className="btn btn-primary">
                Send a gift <Arrow />
              </Link>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
            <div className="trust">
              <div className="avatars" aria-hidden="true">
                <span>N</span>
                <span>J</span>
                <span>M</span>
                <span>R</span>
                <span>+</span>
              </div>
              <div>
                <div className="stars">★★★★★</div>
                <div>Loved by early gifters across 40+ brands</div>
              </div>
            </div>
          </div>

          <div className="phone" aria-label="eGift mobile app preview">
            <div className="screen">
              <div className="screen-top">
                <div className="sgreet">Good afternoon, Nadia</div>
                <div className="sbal">$485.00</div>
                <div className="scap">Across 6 active cards</div>
              </div>
              <div className="screen-body">
                <div className="sec-label">Your wallet</div>
                <div className="mini-card mc-a">
                  <div className="brand-row">
                    <span>Universal eGift</span>
                    <span className="chip"></span>
                  </div>
                  <div className="amt">$150.00</div>
                </div>
                <div className="mini-card mc-b">
                  <div className="brand-row">
                    <span>Coffee &amp; Co.</span>
                    <span className="chip"></span>
                  </div>
                  <div className="amt">$45.00</div>
                </div>
                <div className="mini-card mc-c">
                  <div className="brand-row">
                    <span>Birthday Pool 🎉</span>
                    <span className="chip"></span>
                  </div>
                  <div className="amt">$290.00</div>
                </div>
              </div>
              <div className="screen-nav" aria-hidden="true">
                <i className="on"></i>
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STRIP */}
      <div className="strip">
        <div className="wrap strip-in">
          <span className="t">Redeemable at</span>
          <b>Marketplace</b>
          <b>Café Row</b>
          <b>StreamBox</b>
          <b>Homegoods</b>
          <b>TechMart</b>
          <b>Local+</b>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="band" id="how">
        <div className="wrap">
          <div className="band-head">
            <span className="eyebrow">How it works</span>
            <h2>Gifting in three taps</h2>
            <p>No more hunting through emails for codes or juggling cards that only work at one store.</p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="n">01</div>
              <h3>Pick an amount</h3>
              <p>Choose a value and a universal card, or target a specific brand. Split the cost with a group if you like.</p>
            </div>
            <div className="step">
              <div className="n">02</div>
              <h3>Make it personal</h3>
              <p>Add a message, choose an occasion theme, and schedule delivery for the exact moment it should land.</p>
            </div>
            <div className="step">
              <div className="n">03</div>
              <h3>They redeem, flexibly</h3>
              <p>Recipients spend at any supported retailer, convert balances, or save the card in their eGift wallet.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GROUP GIFTING */}
      <section className="band" id="group" style={{ paddingBlock: 20 }}>
        <div className="wrap">
          <div className="feature">
            <div className="ftext">
              <span className="eyebrow">Group gifting</span>
              <h2>Everyone chips in. One card arrives.</h2>
              <p className="desc">
                Start a gift pool, share a link, and let friends and family contribute any amount. eGift combines it into a single card the recipient actually
                wants.
              </p>
              <ul>
                <li><Check />Shareable contribution link — no app required to pitch in</li>
                <li><Check />Live goal tracking so the group sees progress</li>
                <li><Check />Every contributor's note is bundled into one card</li>
              </ul>
            </div>
            <div className="mock">
              <div className="mock-bar">
                <i></i>
                <i></i>
                <i></i>
                <span>Birthday pool for Jordan</span>
              </div>
              <div className="mock-body">
                <div className="pool-head">
                  <div className="goal">
                    $290 <b>of $400 goal</b>
                  </div>
                  <div className="pct">72%</div>
                </div>
                <div className="bar">
                  <i></i>
                </div>
                <div className="contribs">
                  <div className="contrib"><span className="av" style={{ background: '#6a5cff' }}>M</span><span className="nm">Maya R.</span><span className="vl">$100</span></div>
                  <div className="contrib"><span className="av" style={{ background: '#37c9aa' }}>T</span><span className="nm">Theo B.</span><span className="vl">$75</span></div>
                  <div className="contrib"><span className="av" style={{ background: '#ffab4c' }}>P</span><span className="nm">Priya K.</span><span className="vl">$65</span></div>
                  <div className="contrib"><span className="av" style={{ background: '#ff6a7e' }}>S</span><span className="nm">Sam &amp; Lee</span><span className="vl">$50</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONALIZED MESSAGE */}
      <section className="band" style={{ paddingBlock: 20 }}>
        <div className="wrap">
          <div className="feature rev">
            <div className="ftext">
              <span className="eyebrow">Personalized messages</span>
              <h2>A gift that sounds like you.</h2>
              <p className="desc">
                Wrap any card in a message, an occasion theme, and a delivery time. The recipient opens something that feels made for them — not a forwarded
                code.
              </p>
              <ul>
                <li><Check />Themed designs for birthdays, thanks, holidays and more</li>
                <li><Check />Schedule delivery to the minute</li>
                <li><Check />Add a photo or short video note</li>
              </ul>
            </div>
            <div className="mock">
              <div className="mock-bar">
                <i></i>
                <i></i>
                <i></i>
                <span>Compose gift</span>
              </div>
              <div className="mock-body composer">
                <div className="to">
                  To: <b>Jordan Avery</b> · delivers Sat 9:00 AM
                </div>
                <div className="giftcard-prev">
                  <div className="occ">🎉 Happy Birthday</div>
                  <div className="amt">$400.00</div>
                  <div className="msg">"Pick something ridiculous. You earned it. — the whole crew"</div>
                </div>
                <div className="msg-input">Pick something ridiculous. You earned it. — the whole crew|</div>
                <div className="emoji-row">
                  <b className="sel">🎉</b>
                  <b>🎂</b>
                  <b>🎁</b>
                  <b>❤️</b>
                  <b>✨</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLEXIBLE REDEMPTION */}
      <section className="band" id="redeem" style={{ paddingBlock: '20px 72px' }}>
        <div className="wrap">
          <div className="feature">
            <div className="ftext">
              <span className="eyebrow">Flexible redemption</span>
              <h2>Spend it their way.</h2>
              <p className="desc">
                A universal balance isn't locked to one store. Recipients choose where it goes, split it across brands, or keep it in their wallet for later.
              </p>
              <ul>
                <li><Check />Redeem at any supported retailer</li>
                <li><Check />Split one balance across several brands</li>
                <li><Check />Transfer or re-gift unused value</li>
              </ul>
            </div>
            <div className="mock">
              <div className="mock-bar">
                <i></i>
                <i></i>
                <i></i>
                <span>Redeem $150.00</span>
              </div>
              <div className="mock-body">
                <div className="redeem">
                  <div className="redeem-opt sel">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M3 9h18M3 9l2-5h14l2 5M3 9v10a1 1 0 001 1h16a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                    </span>
                    <div><div className="rt">Spend at a retailer</div><div className="rs">40+ brands available now</div></div>
                    <span className="rr"></span>
                  </div>
                  <div className="redeem-opt">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M8 7h8M8 12h8M8 17h5M4 4h16v16H4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                    </span>
                    <div><div className="rt">Split across brands</div><div className="rs">Divide this balance any way</div></div>
                    <span className="rr"></span>
                  </div>
                  <div className="redeem-opt">
                    <span className="ic">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16v12H4zM4 7l4-4h8l4 4M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
                    </span>
                    <div><div className="rt">Re-gift to someone</div><div className="rs">Pass the balance along</div></div>
                    <span className="rr"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WALLET */}
      <section className="band wallet-band" id="wallet">
        <div className="wrap">
          <div className="band-head">
            <span className="eyebrow">The wallet</span>
            <h2>Every card. Every brand. Organized.</h2>
            <p>No more digging through email. Balances, expirations and statuses live together in one tidy wallet.</p>
          </div>
          <div className="wallet-grid">
            <div className="gcard g1"><div className="top"><span className="nm">Universal eGift</span><span className="st">Active</span></div><div><div className="bal">$150.00</div><div className="exp">No expiration</div></div></div>
            <div className="gcard g2"><div className="top"><span className="nm">Coffee &amp; Co.</span><span className="st">Active</span></div><div><div className="bal">$45.00</div><div className="exp">Exp. Dec 2027</div></div></div>
            <div className="gcard g3"><div className="top"><span className="nm">Homegoods</span><span className="st">Active</span></div><div><div className="bal">$80.00</div><div className="exp">Exp. Mar 2027</div></div></div>
            <div className="gcard g4"><div className="top"><span className="nm">StreamBox</span><span className="st">Active</span></div><div><div className="bal">$60.00</div><div className="exp">No expiration</div></div></div>
            <div className="gcard g5"><div className="top"><span className="nm">TechMart</span><span className="st">Active</span></div><div><div className="bal">$50.00</div><div className="exp">Exp. Aug 2027</div></div></div>
            <div className="gcard g6"><div className="top"><span className="nm">Local+ Card</span><span className="st" style={{ background: 'rgba(255,255,255,.3)' }}>Low</span></div><div><div className="bal">$5.00</div><div className="exp">Exp. Nov 2026</div></div></div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="band" style={{ paddingBlock: 60 }}>
        <div className="wrap">
          <div className="stats">
            <div className="stat"><div className="big">40+</div><div className="lbl">Supported brands</div></div>
            <div className="stat"><div className="big">1</div><div className="lbl">Unified wallet</div></div>
            <div className="stat"><div className="big">$0</div><div className="lbl">Hidden fees</div></div>
            <div className="stat"><div className="big">3</div><div className="lbl">Taps to send</div></div>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="band" style={{ paddingBlock: '20px 72px' }}>
        <div className="wrap">
          <div className="band-head">
            <span className="eyebrow">Anywhere you are</span>
            <h2>Web, iOS &amp; Android</h2>
            <p>One account, synced across every device — a responsive web app and native-feeling mobile experiences.</p>
          </div>
          <div className="plat">
            <div className="plat-card">
              <div className="pi"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 5h18v11H3zM3 16l-1 3h20l-1-3M9 19h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></div>
              <h3>Web app</h3>
              <p>Full gifting, pools and wallet management in any browser.</p>
            </div>
            <div className="plat-card">
              <div className="pi"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M7 2h10v20H7zM11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></div>
              <h3>iOS</h3>
              <p>Apple Wallet-ready cards and instant push on delivery.</p>
            </div>
            <div className="plat-card">
              <div className="pi"><svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M7 2h10v20H7zM11 18h2" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></div>
              <h3>Android</h3>
              <p>Google Pay integration and scheduled gift reminders.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="band final" id="get" style={{ paddingBlock: '20px 80px' }}>
        <div className="wrap">
          <div className="final-box">
            <h2>Give something they'll actually use.</h2>
            <p>Start a gift, open a pool, or build your wallet in under a minute. No fees, no retailer lock-in.</p>
            <Link to={start} className="btn btn-dark">
              Send your first gift
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="fcol" style={{ maxWidth: 240 }}>
              <div className="brand" style={{ marginBottom: 12 }}>
                <Logo />
                <span>
                  eGift<small>by appyyo</small>
                </span>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>The universal digital gift card platform. Give, receive and manage every card in one place.</p>
            </div>
            <div className="fcol"><h4>Product</h4><a href="#how">How it works</a><a href="#group">Group gifting</a><a href="#redeem">Redemption</a><a href="#wallet">Wallet</a></div>
            <div className="fcol"><h4>Company</h4><a href="#">About</a><a href="#">Brand partners</a><a href="#">Careers</a><a href="#">Press</a></div>
            <div className="fcol"><h4>Support</h4><a href="#">Help center</a><a href="#">Contact</a><a href="#">Security</a><a href="#">Status</a></div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Appyyo, Inc. All rights reserved.</span>
            <span>Privacy · Terms · Cookies</span>
          </div>
        </div>
      </footer>
    </>
  );
}
