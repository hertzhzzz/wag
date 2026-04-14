import { Metadata } from 'next'
import EnquiryForm from './EnquiryForm'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import FAQSchema from '@/components/FAQSchema'

const enquiryFaqs = [
  {
    question: 'Is there any upfront cost to enquire?',
    answer: 'None. The initial consultation is completely free.',
  },
  {
    question: 'Do you push me towards specific suppliers?',
    answer: 'No. The decision is entirely yours.',
  },
  {
    question: 'What if I am not ready to travel yet?',
    answer: 'Book a call to discuss — we can plan well in advance.',
  },
]

export const metadata: Metadata = {
  title: 'Contact WAG | Request a Free Discovery Call',
  description: 'Get in touch for China sourcing consultation. Factory tours, supplier verification, and bulk procurement support for Australian businesses. Book your free discovery call today.',
  keywords: ['china sourcing consultation', 'factory tour enquiry', 'australian business china', 'contact wag', 'supplier verification quote', 'china procurement help'],
  openGraph: {
    title: 'Contact Winning Adventure Global',
    description: 'Get expert China sourcing help. Book your free discovery call.',
    url: 'https://www.winningadventure.com.au/enquiry',
    siteName: 'Winning Adventure Global',
    images: [
      {
        url: 'https://www.winningadventure.com.au/og-image.jpg',
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
    description: 'Get expert China sourcing help. Book your free discovery call.',
    images: ['https://www.winningadventure.com.au/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
  },
}

export default function EnquiryPage() {
  return (
    <>
      <FAQSchema faqs={enquiryFaqs} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Enquiry', url: 'https://www.winningadventure.com.au/enquiry' }
      ]} />
      <EnquiryForm />
    </>
  )
}
