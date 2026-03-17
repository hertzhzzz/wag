import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book a Factory Tour | Free Consultation - Winning Adventure Global',
  description: 'Book your China factory tour consultation. We respond within 4 business hours. Visit pre-screened manufacturers with bilingual guides.',
  keywords: ['book factory tour China', 'free consultation China sourcing', 'factory visit booking', 'China procurement consultation', 'Australian business China'],
  openGraph: {
    title: 'Book a Factory Tour Consultation',
    description: 'Book your China factory tour consultation. Free initial consultation with bilingual guides.',
    url: 'https://www.winningadventure.com.au/enquiry',
  },
}

export default function EnquiryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
