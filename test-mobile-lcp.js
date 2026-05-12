const { chromium } = require('playwright');

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const DEVICE_PIXEL_RATIO = 2;

async function measureLCP(page, url) {
  // Set mobile viewport and device pixel ratio
  await page.setViewportSize(MOBILE_VIEWPORT);
  await page.evaluate((dpr) => {
    Object.defineProperty(window, 'devicePixelRatio', { value: dpr });
  }, DEVICE_PIXEL_RATIO);

  // Enable Performance observer for LCP
  const lcpData = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let lcpEntry = null;
      let lcpElement = null;

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcpEntry = lastEntry.startTime;
          lcpElement = lastEntry.element ? lastEntry.element.tagName : null;
          // Try to get element info
          if (lastEntry.element) {
            lcpElement = lastEntry.element.tagName +
              (lastEntry.element.className ? '.' + lastEntry.element.className.replace(/\s+/g, '.') : '') +
              (lastEntry.element.id ? '#' + lastEntry.element.id : '');
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Also get paint timing for fallback
      const paintEntries = performance.getEntriesByType('paint');
      const lcpPaint = paintEntries.find(e => e.name === 'largest-contentful-paint');

      // Fallback to first contentful paint + navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0];

      // Resolve after a short wait to capture LCP
      setTimeout(() => {
        observer.disconnect();
        resolve({
          lcpTime: lcpEntry || navTiming?.loadEventStart || null,
          lcpElement: lcpElement || 'unknown',
          navTiming: navTiming ? {
            domContentLoaded: navTiming.domContentLoadedEventEnd,
            load: navTiming.loadEventEnd,
            firstPaint: paintEntries.find(e => e.name === 'first-paint')?.startTime,
            fcp: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime
          } : null
        });
      }, 2000);

      // Navigate
      window.location.href = url;
    });
  });

  return lcpData;
}

async function collectBlockingResources(page) {
  return await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    const blocking = resources.filter(r => {
      // Resources that block rendering: CSS and sync scripts
      return r.initiatorType === 'link' || r.initiatorType === 'script';
    });
    return blocking.map(r => ({
      name: r.name,
      type: r.initiatorType,
      duration: r.duration,
      size: r.transferSize
    }));
  });
}

async function runTest() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: DEVICE_PIXEL_RATIO,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });

  const results = [];

  const pages = [
    { name: 'Homepage', url: 'https://www.winningadventure.com.au' },
    { name: '/about', url: 'https://www.winningadventure.com.au/about' },
    { name: '/resources', url: 'https://www.winningadventure.com.au/resources' }
  ];

  for (const p of pages) {
    console.log(`\nTesting ${p.name}...`);
    const page = await context.newPage();

    try {
      // Navigate and wait for network idle
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait a bit for LCP to be captured
      await page.waitForTimeout(2000);

      // Get LCP from Performance API
      const lcpMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let lcpTime = null;
          let lcpElement = null;

          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              lcpTime = lastEntry.startTime;
              if (lastEntry.element) {
                const el = lastEntry.element;
                lcpElement = el.tagName +
                  (el.className ? '.' + el.className.toString().split(' ').join('.') : '') +
                  (el.id ? '#' + el.id : '');
              }
            }
          });

          observer.observe({ entryTypes: ['largest-contentful-paint'] });

          setTimeout(() => {
            observer.disconnect();

            // Also check paint timing
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(e => e.name === 'first-contentful-paint');

            // Get navigation timing
            const navEntries = performance.getEntriesByType('navigation');
            const nav = navEntries[0] || {};

            resolve({
              lcpTime: lcpTime || nav.loadEventEnd || null,
              lcpElement: lcpElement || 'unknown',
              fcp: fcp?.startTime || null,
              ttfb: nav.responseStart || null,
              loadComplete: nav.loadEventEnd || null
            });
          }, 1500);
        });
      });

      // Collect blocking resources
      const blockingResources = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources
          .filter(r => r.initiatorType === 'link' || r.initiatorType === 'script')
          .map(r => ({
            url: r.name.substring(0, 80),
            type: r.initiatorType,
            duration: Math.round(r.duration),
            size: r.transferSize
          }));
      });

      results.push({
        page: p.name,
        url: p.url,
        ...lcpMetrics,
        blockingResources
      });

      console.log(`  LCP: ${lcpMetrics.lcpTime ? Math.round(lcpMetrics.lcpTime) + 'ms' : 'N/A'}`);
      console.log(`  LCP Element: ${lcpMetrics.lcpElement}`);
      console.log(`  FCP: ${lcpMetrics.fcp ? Math.round(lcpMetrics.fcp) + 'ms' : 'N/A'}`);
      console.log(`  TTFB: ${lcpMetrics.ttfb ? Math.round(lcpMetrics.ttfb) + 'ms' : 'N/A'}`);
      console.log(`  Blocking resources: ${blockingResources.length}`);

    } catch (err) {
      console.error(`  Error: ${err.message}`);
      results.push({ page: p.name, error: err.message });
    }

    await page.close();
  }

  await browser.close();

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('Mobile LCP Results (390x844, 2x DPR)');
  console.log('='.repeat(60));

  for (const r of results) {
    if (r.error) {
      console.log(`\n- ${r.page}: ERROR - ${r.error}`);
      continue;
    }
    console.log(`\n- ${r.page}: ${r.lcpTime ? Math.round(r.lcpTime) + 'ms' : 'N/A'}, LCP element: ${r.lcpElement}`);
  }

  console.log('\nBlocking Resources:');
  const allBlocking = results.flatMap(r => r.blockingResources || []);
  const uniqueBlocking = [...new Map(allBlocking.map(b => [b.url, b])).values()];
  if (uniqueBlocking.length > 0) {
    uniqueBlocking.forEach(b => {
      console.log(`  - ${b.type}: ${b.url}... (${b.duration}ms, ${b.size || 0} bytes)`);
    });
  } else {
    console.log('  None detected');
  }

  console.log('\nRecommendations:');
  if (results.some(r => r.lcpTime && r.lcpTime > 2500)) {
    console.log('  - LCP > 2.5s: Consider optimizing hero image (preload, compress, use WebP)');
  }
  if (uniqueBlocking.some(b => b.type === 'script')) {
    console.log('  - Render-blocking scripts detected: defer/async or move to footer');
  }
  if (uniqueBlocking.some(b => b.type === 'link')) {
    console.log('  - Render-blocking CSS: inline critical CSS, lazy-load non-critical');
  }
}

runTest().catch(console.error);
