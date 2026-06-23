import { NextResponse } from "next/server"

/**
 * Branded HTTP 410 Gone response.
 *
 * Returns styled HTML (matching app/not-found.tsx — navy #0F2D5E, amber #F59E0B,
 * IBM Plex fonts) WITH a true 410 status code. We render HTML directly from
 * middleware (edge runtime) because Next.js App Router pages always return 200;
 * the status code is what matters for SEO (410 = permanently gone), and the
 * markup gives humans a branded page instead of plain "Gone".
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
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600&family=IBM+Plex+Serif:wght@700&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif; color: #0F2D5E; }
    .hero {
      min-height: 70vh; background: #0F2D5E; display: flex;
      align-items: center; justify-content: center; padding: 2rem;
    }
    .wrap { text-align: center; max-width: 600px; }
    .eyebrow {
      color: #F59E0B; font-size: .75rem; font-weight: 700;
      letter-spacing: .2em; text-transform: uppercase; margin-bottom: 1rem;
    }
    h1 {
      font-family: 'IBM Plex Serif', Georgia, serif; color: #fff;
      font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 700;
      line-height: 1.1; margin-bottom: 1.5rem;
    }
    p.lead { color: #bcd0ee; font-size: 1.125rem; margin: 0 auto 2.5rem; max-width: 480px; }
    .btns { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
    a.btn {
      text-decoration: none; padding: 1rem 2rem; font-size: .875rem; font-weight: 700;
      transition: background .2s, color .2s;
    }
    a.primary { background: #F59E0B; color: #0F2D5E; }
    a.primary:hover { background: #d97706; }
    a.ghost { border: 1px solid rgba(255,255,255,.3); color: #fff; font-weight: 600; }
    a.ghost:hover { background: rgba(255,255,255,.1); }
    .links { padding: 4rem 2rem; background: #fff; }
    .links-inner { max-width: 1000px; margin: 0 auto; }
    .links-eyebrow {
      text-align: center; color: #F59E0B; font-size: .75rem; font-weight: 700;
      letter-spacing: .15em; text-transform: uppercase; margin-bottom: 2rem;
    }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    @media (min-width: 768px) { .grid { grid-template-columns: repeat(4, 1fr); } }
    a.card {
      text-decoration: none; text-align: center; padding: 1rem;
      border: 1px solid #e5e7eb; color: #0F2D5E; font-weight: 600;
      transition: border-color .2s, box-shadow .2s;
    }
    a.card:hover { border-color: #0F2D5E; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); }
  </style>
</head>
<body>
  <section class="hero">
    <div class="wrap">
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
</body>
</html>`

  return new NextResponse(html, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  })
}
