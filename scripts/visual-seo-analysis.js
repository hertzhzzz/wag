const { chromium } = require('playwright');

const URL = 'https://winningadventure.com.au';
const SCREENSHOT_DIR = '/Users/mark/Projects/wag-frontend/screenshots';

async function capturePage(page, path, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(URL + path, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({
    path: `${SCREENSHOT_DIR}${path.replace(/\//g, '_') || '_home'}_${viewport.width}x${viewport.height}.png`,
    fullPage: false
  });
}

async function analyze() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pages = ['/', '/services', '/about', '/resources', '/enquiry'];
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    errors.push(`Page Error: ${err.message}`);
  });

  for (const path of pages) {
    console.log(`\n=== Analyzing ${path} ===`);

    for (const vp of viewports) {
      console.log(`  Capturing ${vp.name} (${vp.width}x${vp.height})...`);
      await capturePage(page, path, { width: vp.width, height: vp.height });
    }

    // Check for CLS - measure layout stability
    const clsScore = await page.evaluate(() => {
      return new Promise(resolve => {
        let cls = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cls += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        setTimeout(() => {
          observer.disconnect();
          resolve(cls);
        }, 2000);
      });
    });

    console.log(`  CLS score: ${clsScore.toFixed(4)}`);

    // Check for broken images
    const brokenImages = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      const broken = [];
      imgs.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          broken.push(img.src || img.alt);
        }
      });
      return broken;
    });

    if (brokenImages.length > 0) {
      console.log(`  Broken images: ${brokenImages.length}`);
      brokenImages.forEach(src => console.log(`    - ${src}`));
    }
  }

  console.log('\n=== Console Errors ===');
  const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'));
  if (criticalErrors.length === 0) {
    console.log('No critical errors found');
  } else {
    criticalErrors.forEach(e => console.log(`  ERROR: ${e}`));
  }

  // Mobile nav check
  console.log('\n=== Mobile Navigation Check ===');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: 'networkidle' });

  const mobileNav = await page.evaluate(() => {
    const nav = document.querySelector('nav');
    const hamburger = document.querySelector('[aria-label*="menu" i], [aria-label*="Menu"], button[class*="menu"], button[class*="hamburger"]');
    return {
      hasNav: !!nav,
      hasHamburger: !!hamburger,
      navElements: nav ? nav.innerHTML.length : 0
    };
  });
  console.log(`  Has nav: ${mobileNav.hasNav}`);
  console.log(`  Has hamburger menu: ${mobileNav.hasHamburger}`);

  // Cookie banner check
  const cookieBanner = await page.evaluate(() => {
    const banner = document.querySelector('[class*="cookie"], [id*="cookie"], [aria-label*="cookie" i]');
    return banner ? banner.getBoundingClientRect().toString() : null;
  });
  console.log(`  Cookie banner: ${cookieBanner ? 'Found' : 'Not found'}`);

  // Above-the-fold content check
  console.log('\n=== Above-the-Fold Content Check ===');
  const aboveFold = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const hero = document.querySelector('[class*="hero"], [class*="Hero"], main > div:first-child');
    const cta = document.querySelector('a[href*="enquiry"], button[class*="enquiry"], a:has-text("Enquiry")');
    return {
      hasH1: !!h1,
      h1Text: h1 ? h1.textContent.trim().substring(0, 50) : null,
      h1Visible: h1 ? h1.getBoundingClientRect().top < window.innerHeight : false,
      hasHero: !!hero,
      hasCTA: !!cta,
      heroHeight: hero ? hero.getBoundingClientRect().height : 0
    };
  });
  console.log(`  H1: "${aboveFold.h1Text}" (visible: ${aboveFold.h1Visible})`);
  console.log(`  Hero section: ${aboveFold.hasHero} (height: ${aboveFold.heroHeight}px)`);
  console.log(`  CTA visible: ${aboveFold.hasCTA}`);

  await browser.close();
  console.log('\n=== Screenshots saved to ' + SCREENSHOT_DIR + ' ===');
}

analyze().catch(console.error);
