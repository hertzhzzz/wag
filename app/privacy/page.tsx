import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Winning Adventure Global',
  description: 'Privacy Policy for Winning Adventure Global — how we collect, use, and protect your personal information when you use our China factory tours and sourcing services.',
  keywords: ['privacy policy winning adventure global', 'WAG privacy', 'china sourcing service privacy'],
  openGraph: {
    title: 'Privacy Policy | Winning Adventure Global',
    description: 'How we collect, use, and protect your personal information.',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-[900px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
          <p className="text-white/60 text-sm">Last updated: April 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-[900px] mx-auto prose prose-slate prose-headings:text-navy prose-p:text-gray-600 prose-li:text-gray-600">

          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Winning Adventure Global (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name and contact details (email address, phone number, postal address)</li>
            <li>Business information (company name, ABN, industry)</li>
            <li>Enquiry form data (products of interest, sourcing requirements, trip preferences)</li>
            <li>Communication preferences</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your enquiries and provide sourcing consultation services</li>
            <li>Facilitate factory visits and procurement support</li>
            <li>Send you relevant updates, newsletters, and service information (you may opt out at any time)</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Data Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
          <ul>
            <li>Service providers who assist us in operating our business (e.g., email delivery, CRM systems)</li>
            <li>Chinese manufacturers and logistics partners, solely for the purpose of fulfilling your sourcing requests</li>
            <li>Legal authorities, when required by law or to protect our rights</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2>Cookies</h2>
          <p>
            Our website uses cookies to enhance user experience and analyse site traffic. You may choose to disable cookies through your browser settings, though this may affect site functionality.
          </p>

          <h2>Your Rights</h2>
          <p>Under Australian privacy law, you have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of any inaccurate information</li>
            <li>Opt out of marketing communications at any time</li>
            <li>Lodge a complaint with the Office of the Australian Information Commissioner (OAIC)</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
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

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The latest version will be posted on this page with a revised &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
          </p>

        </div>
      </section>
    </main>
  )
}