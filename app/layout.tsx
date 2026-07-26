import type { Metadata } from 'next'
import { Suspense } from 'react'
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import ScrollTracker from './components/ScrollTracker'
import GaPageView from './components/GaPageView'
import { buildOrganizationSchema } from '@/lib/schema'


const ibmPlexSans = IBM_Plex_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
  preload: true,
})

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-serif',
  display: 'swap',
  // Serif is used in hero H1 — keep preload so LCP text is not late-swapped
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.winningadventure.com.au'),
  title: {
    template: '%s | Winning Adventure Global',
    default: 'China Sourcing for Australian Businesses | Winning Adventure Global',
  },
  description: 'Australia-based China sourcing for Australian businesses: find and vet new suppliers, or visit and verify an existing factory. Factory tours and verification remain secondary-path support.',
  keywords: [
    'china sourcing australia',
    'find china suppliers',
    'australian business china sourcing',
    'supplier verification china',
    'factory visit china',
    'china procurement support',
  ],
  authors: [{ name: 'Andy Liu' }],
  creator: 'Winning Adventure Global',
  publisher: 'Winning Adventure Global',
  // Preview builds: meta robots noindex (complements X-Robots-Tag + robots.ts).
  // Production: fully indexable — VERCEL_ENV is "production" only on prod deploys.
  robots:
    process.env.VERCEL_ENV === 'preview'
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            // Cap SERP/AI Overview snippet length (product decision: 150, not unlimited -1)
            'max-snippet': 150,
          },
        },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://www.winningadventure.com.au',
    siteName: 'Winning Adventure Global',
    title: 'China Sourcing for Australian Businesses | Winning Adventure Global',
    description: 'Find and vet China suppliers for Australian businesses — or visit and verify an existing factory. Verification remains a secondary path.',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Winning Adventure Global - China Factory Tours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'China Sourcing for Australian Businesses | Winning Adventure Global',
    description: 'Find and vet China suppliers, or visit and verify an existing factory. Australia-based China sourcing support.',
    images: ['/og-image.webp'],
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au',
      'x-default': 'https://www.winningadventure.com.au',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
}

export const links = () => [
  { rel: 'preconnect', href: 'https://www.winningadventure.com.au' },
  { rel: 'preload', href: '/logos/logo-nav-trans.png', as: 'image' },
]

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en-AU" data-scroll-behavior="smooth" className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable}`}>
      <head>
        {/* Hero preloading is per-page: each page's hero uses next/image `priority`,
            which injects the correct preload for THAT page. A global hero preload here
            would force every sub-page to high-priority-fetch the homepage poster it never
            shows, stealing priority from its own hero. */}
        {/* hreflang: set per-page via metadata.alternates.languages only.
            Do not hardcode homepage-only global alternates here — they conflict with page self-signals. */}
        {/* Google tag — raw <script> so Google Ads bot can detect it in server-rendered HTML */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18216448449"></script>
        {/* send_page_view true on first load; GaPageView covers App Router soft navigations */}
        <script dangerouslySetInnerHTML={{__html:`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18216448449');gtag('config','G-VEGJ1YL8YR',{send_page_view:true,anonymize_ip:true});`}} />
        <Script id="meta-pixel" strategy="lazyOnload" dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1302675338716439');
            fbq('track', 'PageView');
          `
        }} />
        <Script async src="https://analytics.ahrefs.com/analytics.js" data-key="jnLQ8HPV22LB0X0XwFMCxw" strategy="lazyOnload" type="text/partytown" />
        <Script id="partytown-config" type="text/partytown">
          {`partytown = { lib: "/~partytown/", forward: ["dataLayer.push", "gtag"] }`}
        </Script>
        {/* Meta Pixel noscript fallback */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }} src="https://www.facebook.com/tr?id=1302675338716439&ev=PageView&noscript=1" alt="" />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildOrganizationSchema())
          }}
        />
      </head>
      <body>
      <main id="main-content">
        {children}
      </main>
      <ScrollTracker />
      <Suspense fallback={null}>
        <GaPageView />
      </Suspense>
      <Analytics />
    </body>
    </html>
  )
}
