import { NextResponse } from "next/server"

/**
 * Branded HTTP 410 Gone response.
 *
 * Returns styled HTML (matching app/not-found.tsx — navy #0F2D5E, amber #F59E0B,
 * IBM Plex fonts, full Navbar + Footer) WITH a true 410 status code. We render
 * HTML directly from middleware (edge runtime) because Next.js App Router pages
 * always return 200; the status code is what matters for SEO (410 = permanently
 * gone), and the markup gives humans a fully branded page.
 *
 * NOTE: the Navbar/Footer markup here mirrors app/components/Navbar.tsx and
 * Footer.tsx. If those change, update this file too (edge runtime can't import
 * the React components).
 */
export function goneResponse(): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en-AU">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <title>410 - Content Removed | Winning Adventure Global</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@700&display=swap" rel="stylesheet" />
  <style>
    :root { --navy: #0F2D5E; --amber: #F59E0B; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif; color: var(--navy); }
    a { text-decoration: none; }

    /* Navbar */
    .nav {
      background: rgba(255,255,255,.97); box-shadow: 0 1px 3px rgba(15,45,94,.08);
      padding: .5rem 1rem;
    }
    .nav-inner { max-width: 1400px; margin: 0 auto; display: flex; align-items: center; gap: 1rem; }
    .nav-logo img { height: 48px; width: auto; display: block; }
    .nav-links { list-style: none; display: flex; gap: 2.25rem; flex: 1; justify-content: center; }
    .nav-links a { font-size: 14px; color: var(--navy); padding-bottom: 4px; position: relative; }
    .nav-links a::after {
      content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 2px;
      background: var(--navy); transition: width .25s ease;
    }
    .nav-links a:hover::after { width: 100%; }
    .nav-cta { display: flex; gap: .75rem; }
    .nav-call {
      display: flex; flex-direction: column; padding: 8px 14px; color: var(--navy);
      background: rgba(255,255,255,.8); border: 1px solid rgba(15,45,94,.2); line-height: 1.1;
    }
    .nav-call .s { font-size: 10px; font-weight: 500; text-transform: uppercase; letter-spacing: .03em; }
    .nav-call .b { font-size: 13px; font-weight: 600; }
    .nav-quote { font-size: 13px; font-weight: 500; padding: 9px 22px; color: #fff; background: var(--navy); box-shadow: 0 4px 6px rgba(0,0,0,.1); }
    @media (max-width: 860px) { .nav-links, .nav-cta { display: none; } }

    /* Hero */
    .hero { min-height: 60vh; background: var(--navy); display: flex; align-items: center; justify-content: center; padding: 4rem 2rem; }
    .hero-wrap { text-align: center; max-width: 600px; }
    .eyebrow { color: var(--amber); font-size: .75rem; font-weight: 700; letter-spacing: .2em; text-transform: uppercase; margin-bottom: 1rem; }
    h1 { font-family: 'IBM Plex Serif', Georgia, serif; color: #fff; font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700; line-height: 1.1; margin-bottom: 1.5rem; }
    p.lead { color: #bcd0ee; font-size: 1.125rem; margin: 0 auto 2.5rem; max-width: 480px; }
    .btns { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
    a.btn { padding: 1rem 2rem; font-size: .875rem; font-weight: 700; transition: background .2s, color .2s; }
    a.primary { background: var(--amber); color: var(--navy); }
    a.primary:hover { background: #d97706; }
    a.ghost { border: 1px solid rgba(255,255,255,.3); color: #fff; font-weight: 600; }
    a.ghost:hover { background: rgba(255,255,255,.1); }

    /* Quick links */
    .links { padding: 4rem 2rem; background: #fff; }
    .links-inner { max-width: 1000px; margin: 0 auto; }
    .links-eyebrow { text-align: center; color: var(--amber); font-size: .75rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    @media (min-width: 768px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    a.card { text-align: center; padding: 1rem; border: 1px solid #e5e7eb; color: var(--navy); font-weight: 600; transition: border-color .2s, box-shadow .2s; }
    a.card:hover { border-color: var(--navy); box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }

    /* Footer */
    .footer { background: var(--navy); color: #fff; }
    .footer-inner { max-width: 1400px; margin: 0 auto; padding: 0 1rem; }
    .footer-grid { display: grid; grid-template-columns: 1fr; gap: 2.5rem; padding: 4rem 0; }
    @media (min-width: 768px) { .footer-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .footer-grid { grid-template-columns: repeat(4, 1fr); } }
    .footer img { height: 40px; width: auto; margin-bottom: 1.5rem; }
    .footer .tag { color: rgba(255,255,255,.6); font-size: .875rem; line-height: 1.6; max-width: 260px; margin-bottom: 1.5rem; }
    .li-btn { display: inline-flex; align-items: center; gap: .5rem; color: rgba(255,255,255,.7); font-size: .875rem; font-weight: 500; border: 1px solid rgba(255,255,255,.2); padding: .5rem 1rem; border-radius: .5rem; transition: all .3s; }
    .li-btn:hover { border-color: var(--amber); color: var(--amber); background: rgba(255,255,255,.05); }
    .footer h4 { font-size: .75rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; color: var(--amber); margin-bottom: 1.5rem; }
    .footer ul { list-style: none; display: flex; flex-direction: column; gap: .75rem; }
    .footer ul a { color: rgba(255,255,255,.7); font-size: .875rem; transition: color .2s; }
    .footer ul a:hover { color: #fff; }
    .contact { font-size: .875rem; color: rgba(255,255,255,.5); margin-top: 2rem; display: flex; flex-direction: column; gap: .75rem; }
    .contact .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: rgba(255,255,255,.3); margin-bottom: .25rem; }
    .contact a { color: rgba(255,255,255,.6); }
    .contact a:hover { color: var(--amber); }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,.1); padding: 1.5rem 0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
    .footer-bottom span { color: rgba(255,255,255,.4); font-size: .75rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-inner">
      <a class="nav-logo" href="/"><img src="/logos/logo-nav-trans.png" alt="Winning Adventure Global" /></a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/article">Articles</a></li>
        <li><a href="/about">About Us</a></li>
        <li><a href="/enquiry">Enquiry</a></li>
      </ul>
      <div class="nav-cta">
        <a class="nav-call" href="tel:+61416588198"><span class="s">Call Us Today</span><span class="b">+61 0416588198</span></a>
        <a class="nav-quote" href="/enquiry">Get a Free Quote &rarr;</a>
      </div>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-wrap">
      <p class="eyebrow">410 &middot; Content Removed</p>
      <h1>This Article Is No Longer Available</h1>
      <p class="lead">We&rsquo;ve retired this page to keep our library focused on practical China sourcing guidance for Australian businesses. Explore our current resources instead.</p>
      <div class="btns">
        <a class="btn primary" href="/article">Browse Articles</a>
        <a class="btn ghost" href="/">Back to Home</a>
      </div>
    </div>
  </section>

  <section class="links">
    <div class="links-inner">
      <p class="links-eyebrow">Quick Links</p>
      <div class="grid">
        <a class="card" href="/">Home</a>
        <a class="card" href="/services">Services</a>
        <a class="card" href="/article">Articles</a>
        <a class="card" href="/enquiry">Get in Touch</a>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div>
          <a href="/"><img src="/logos/logo-footer.png" alt="Winning Adventure Global" /></a>
          <p class="tag">Connecting Australian businesses with China&rsquo;s finest manufacturers. Your trusted partner for factory sourcing and business travel.</p>
          <a class="li-btn" href="https://www.linkedin.com/company/winning-adventure-global" target="_blank" rel="noopener noreferrer" aria-label="Winning Adventure Global on LinkedIn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Follow us on LinkedIn
          </a>
        </div>

        <div>
          <h4>Solutions</h4>
          <ul>
            <li><a href="/solutions#factory-tours">Business Discovery Trip</a></li>
            <li><a href="/solutions#procurement">Procurement Support</a></li>
            <li><a href="/solutions#verification">Factory Verification</a></li>
            <li><a href="/solutions#verification">Quality Inspection</a></li>
          </ul>
        </div>

        <div>
          <h4>Industries</h4>
          <ul>
            <li><a href="/#industries">Drones &amp; Robotics</a></li>
            <li><a href="/#industries">Beauty &amp; Aesthetics</a></li>
            <li><a href="/#industries">Chemical &amp; Materials</a></li>
            <li><a href="/#industries">Fashion &amp; Textiles</a></li>
            <li><a href="/#industries">AV &amp; Electronics</a></li>
            <li><a href="/#industries">Others</a></li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            <li><a href="/about">About Us</a></li>
            <li><a href="/#howitworks">How It Works</a></li>
            <li><a href="/article">Articles</a></li>
            <li><a href="/enquiry">Contact Us</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/terms">Terms of Service</a></li>
          </ul>
          <div class="contact">
            <div>
              <p class="label">Adelaide Office</p>
              <p>5/54 Melbourne St<br />North Adelaide SA 5006</p>
            </div>
            <div><a href="mailto:mark@winningadventure.com.au">mark@winningadventure.com.au</a></div>
            <div><a href="https://share.google/qQBUJkAAn1ZChq7Mc" target="_blank" rel="noopener noreferrer">Google Business Profile</a></div>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>&copy; 2026 Winning Adventure Global Pty Ltd. All rights reserved.</span>
        <span>ABN: 94 697 886 150</span>
      </div>
    </div>
  </footer>
</body>
</html>`

  return new NextResponse(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
