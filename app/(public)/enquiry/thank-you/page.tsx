import type { Metadata } from 'next'
import ThankYouContent from './ThankYouContent'

export const metadata: Metadata = {
  title: 'Enquiry received | Winning Adventure Global',
  description:
    'We have received your sourcing enquiry and will respond within 4 business hours.',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/enquiry',
  },
}

type ThankYouPageProps = {
  searchParams: Promise<{ id?: string | string[] }>
}

function resolveEnquiryId(raw: string | string[] | undefined): string | null {
  if (typeof raw === 'string') {
    const value = raw.trim()
    return value.length > 0 ? value : null
  }
  if (Array.isArray(raw)) {
    const value = raw[0]?.trim()
    return value ? value : null
  }
  return null
}

/**
 * Post-submit confirmation for Enquiry Page Form only.
 * Conversion events fire on /enquiry before navigation — never here.
 */
export default async function EnquiryThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = await searchParams
  const enquiryId = resolveEnquiryId(params.id)

  return <ThankYouContent enquiryId={enquiryId} />
}
