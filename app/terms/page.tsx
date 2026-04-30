import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Winning Adventure Global',
  description: 'Terms of Service for Winning Adventure Global — governing your use of our factory sourcing, supplier verification, and business travel services in China.',
  keywords: ['terms of service winning adventure global', 'WAG terms', 'china sourcing service terms'],
  openGraph: {
    title: 'Terms of Service | Winning Adventure Global',
    description: 'Terms governing your use of our factory sourcing and China business travel services.',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/terms',
  },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Terms of Service</h1>
          <p className="text-white/60 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-[900px] mx-auto prose prose-slate prose-headings:text-navy prose-p:text-gray-600 prose-li:text-gray-600">

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Welcome to Winning Adventure Global. By accessing or using our website and services, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, please do not use our services.
          </p>

          <h2>Our Services</h2>
          <p>
            Winning Adventure Global provides factory sourcing, factory verification, procurement support, and business travel coordination services connecting Australian businesses with Chinese manufacturers. Our services include organising inspection trips, quality control inspections, and ongoing procurement support.
          </p>

          <h2>Service Fees</h2>
          <p>
            Fees for our services are quoted on a per-project basis. All fees will be clearly communicated in writing before any engagement begins. We may charge for travel costs, interpretation services, inspection fees, and procurement support depending on the scope of work agreed upon.
          </p>

          <h2>Client Responsibilities</h2>
          <p>By engaging our services, you agree to:</p>
          <ul>
            <li>Provide accurate and complete information about your business and sourcing requirements</li>
            <li>Respond to communications within a reasonable timeframe</li>
            <li>Pay all fees in accordance with the agreed payment terms</li>
            <li>Comply with all applicable Australian and Chinese laws and regulations</li>
          </ul>

          <h2>Confidentiality</h2>
          <p>
            We treat all client information with strict confidentiality. Business details, supplier information, pricing, and sourcing requirements will not be disclosed to any third party without your explicit consent, except as required to facilitate the services you have engaged us to provide.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Winning Adventure Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising from your use of our services or any third-party supplier relationships facilitated by us.
          </p>
          <p>
            While we exercise due diligence in factory verification and quality inspection, we cannot guarantee the performance, quality, or compliance of any third-party manufacturer or supplier. We recommend that clients conduct their own due diligence and obtain independent legal advice where appropriate.
          </p>

          <h2>Intellectual Property</h2>
          <p>
            All content on our website, including text, graphics, logos, and images, is the property of Winning Adventure Global and protected by copyright law. You may not reproduce, distribute, or create derivative works without our prior written consent.
          </p>

          <h2>Force Majeure</h2>
          <p>
            We shall not be liable for any failure or delay in performing our services where such failure or delay results from circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, travel restrictions, public health emergencies, or supply chain disruptions.
          </p>

          <h2>Termination</h2>
          <p>
            Either party may terminate an engagement with written notice. In the event of termination, you agree to pay for all services rendered up to the date of termination, including any non-refundable expenses incurred on your behalf.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the laws of South Australia, Australia. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of South Australia.
          </p>

          <h2>Contact Information</h2>
          <p>
            For any questions about these Terms of Service, please contact us:
          </p>
          <div className="not-prose bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <p className="font-semibold text-navy mb-2">Winning Adventure Global</p>
            <p className="text-gray-600 text-sm mb-1">
              5/54 Melbourne St<br />
              North Adelaide SA 5006<br />
              Australia
            </p>
            <p className="text-gray-600 text-sm">
              Email: <a href="mailto:mark@winningadventure.com.au" className="text-navy hover:text-amber transition-colors">mark@winningadventure.com.au</a>
            </p>
            <p className="text-gray-600 text-sm mt-2">ABN: 30 659 034 919</p>
          </div>

        </div>
      </section>
    </main>
  )
}