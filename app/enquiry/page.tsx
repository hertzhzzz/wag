import { Metadata } from 'next'
import EnquiryForm from './EnquiryForm'

export const metadata: Metadata = {
  title: 'Contact WAG | Request a Consultation',
  description: 'Get in touch for China sourcing consultation. Factory tours, supplier verification, and bulk procurement support for Australian businesses.',
  keywords: ['china sourcing consultation', 'factory tour enquiry', 'australian business china', 'contact wag', 'supplier verification quote'],
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
  },
}

export default function EnquiryPage() {
  return <EnquiryForm />
}
