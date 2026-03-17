import { Metadata } from 'next'
import EnquiryForm from './EnquiryForm'

export const metadata: Metadata = {
  title: 'Enquire Now | China Sourcing Services',
  description: 'Get in touch for China sourcing services. Request a factory tour, supplier verification, or procurement support for your business.',
  keywords: ['china sourcing enquiry', 'factory tour quote', 'china sourcing contact'],
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
  },
}

export default function EnquiryPage() {
  return <EnquiryForm />
}
