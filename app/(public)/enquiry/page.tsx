import { Metadata } from 'next'
import EnquiryPageContent from './EnquiryPageContent'

export const metadata: Metadata = {
  title: 'Contact Us | Book a Discovery Call',
  description: 'Get in touch for China sourcing consultation. Factory tours, supplier verification, and bulk procurement support for Australian businesses. Book your discovery call today.',
  keywords: ['china sourcing consultation', 'factory tour enquiry', 'australian business china', 'contact wag', 'supplier verification quote', 'china procurement help'],
  openGraph: {
    title: 'Contact Winning Adventure Global',
    description: 'Get expert China sourcing help. Book your discovery call.',
    url: 'https://www.winningadventure.com.au/enquiry',
    siteName: 'Winning Adventure Global',
    images: [
      {
        url: 'https://www.winningadventure.com.au/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Winning Adventure Global - China Sourcing Experts',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Winning Adventure Global',
    description: 'Get expert China sourcing help. Book your discovery call.',
    images: ['https://www.winningadventure.com.au/og-image.webp'],
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
    languages: {
      'en-AU': 'https://www.winningadventure.com.au/enquiry',
      'x-default': 'https://www.winningadventure.com.au/enquiry',
    },
  },
}

export default function EnquiryPage() {
  return <EnquiryPageContent />
}
