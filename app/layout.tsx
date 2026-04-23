import type { Metadata } from 'next'
import { IBM_Plex_Sans, IBM_Plex_Serif } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import ScrollTracker from './components/ScrollTracker'

const ibmPlexSans = IBM_Plex_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-sans',
})

const ibmPlexSerif = IBM_Plex_Serif({
  weight: ['300', '400', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-serif',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.winningadventure.com.au'),
  title: {
    template: '%s | Winning Adventure Global',
    default: 'China Sourcing Agent for Australian Businesses | Winning Adventure Global',
  },
  description: 'WAG connects Australian businesses with verified Chinese manufacturers across all industries. Pre-screened suppliers, factory tours, and procurement support. No matter your product, we help you source from China with confidence.',
  keywords: ['china sourcing agent', 'verified chinese suppliers', 'australian business china sourcing', 'china procurement support', 'supplier verification china', 'import from china guide', 'china manufacturing agent'],
  authors: [{ name: 'Andy Liu' }],
  creator: 'Winning Adventure Global',
  publisher: 'Winning Adventure Global',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://www.winningadventure.com.au',
    siteName: 'Winning Adventure Global',
    title: 'China Sourcing Agent for Australian Businesses | Winning Adventure Global',
    description: 'WAG connects Australian businesses with verified Chinese manufacturers across all industries. Pre-screened suppliers, factory tours, and procurement support.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Winning Adventure Global - China Factory Tours',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WAG | China Sourcing Agent for Australian Businesses',
    description: 'Verified Chinese manufacturers across all industries. Factory tours, supplier verification, and procurement support.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au',
    languages: {
      en: 'https://www.winningadventure.com.au',
    },
  },
  verification: {
    google: 'G-VEGJ1YL8YR',
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

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable}`}>
      <head>
        {/* Preload hero image for LCP — rendered by Hero.tsx on desktop */}
        <link
          rel="preload"
          as="image"
          href="/hero-image.webp"
          fetchPriority="high"
          crossOrigin="anonymous"
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-VEGJ1YL8YR" strategy="lazyOnload" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VEGJ1YL8YR');
          `}
        </Script>
        <Script async src="https://analytics.ahrefs.com/analytics.js" data-key="jnLQ8HPV22LB0X0XwFMCxw" strategy="lazyOnload" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Winning Adventure Global",
              "url": "https://www.winningadventure.com.au",
              "logo": "https://www.winningadventure.com.au/logos/logo.png",
              "description": "WAG connects Australian businesses with verified Chinese manufacturers across all industries. Pre-screened suppliers, factory tours, supplier verification, and end-to-end procurement support.",
              "founder": {
                "@type": "Person",
                "name": "Andy Liu",
                "jobTitle": "Founder",
                "url": "https://www.winningadventure.com.au/about",
                "sameAs": [
                  "https://www.linkedin.com/company/winning-adventure-global"
                ],
                "knowsAbout": ["China Manufacturing", "Supply Chain Management", "Factory Verification", "International Trade", "Pearl River Delta Manufacturing"]
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "5, 54 Melbourne St",
                "addressLocality": "North Adelaide",
                "addressRegion": "SA",
                "postalCode": "5006",
                "addressCountry": "AU"
              },
              "telephone": "+61-416588198",
              "ABN": "30 659 034 919",
              "areaServed": {
                "@type": "Country",
                "name": "Australia"
              },
              "serviceType": ["Factory Tour", "Procurement Support", "Supplier Verification"],
              "priceRange": "Contact for quote",
              "sameAs": [
                "https://www.google.com/maps/place/Winning+Adventure+Global/@-34.9303231,138.6088232,15z/data=!4m6!3m5!1s0x6ad870f9565fbbb3:0x64f74ad4a0ab7b43!8m2!3d-34.9076802!4d138.6063284!16s%2Fg%2F11yyg4dg4j",
                "https://www.linkedin.com/company/winning-adventure-global",
                "https://www.facebook.com/winningadventureglobal",
                "https://www.youtube.com/@winningadventure",
                "https://www.instagram.com/winningadventureglobal",
                "https://share.google/qQBUJkAAn1ZChq7Mc"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Winning Adventure Global",
              "image": "https://www.winningadventure.com.au/logos/logo.png",
              "url": "https://www.winningadventure.com.au",
              "telephone": "+61-416588198",
              "priceRange": "Contact for quote",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "5, 54 Melbourne St",
                "addressLocality": "North Adelaide",
                "addressRegion": "SA",
                "postalCode": "5006",
                "addressCountry": "AU"
              },
              "areaServed": [
                {
                  "@type": "State",
                  "name": "South Australia"
                },
                {
                  "@type": "Country",
                  "name": "Australia"
                }
              ],
              "serviceArea": {
                "@type": "Country",
                "name": "Australia"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -34.9067,
                "longitude": 138.5765
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "opens": "09:00",
                "closes": "18:00"
              }
            })
          }}
        />
      </head>
      <body>
      {children}
      <ScrollTracker />
    </body>
    </html>
  )
}
