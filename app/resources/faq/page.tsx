import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { Metadata } from 'next'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { faqs } from '@/data/faqs'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'

export const metadata: Metadata = {
  title: 'China Sourcing FAQ | Factory Visit Questions Answered',
  description: 'Expert answers to 18 common questions about sourcing from China, visiting factories, and working with manufacturers. Includes guide on supplier verification.',
  keywords: 'china sourcing faq, factory visit questions, chinese supplier guide, australia china trade',
  openGraph: {
    title: 'China Sourcing FAQ | Factory Visit Questions Answered',
    description: 'Expert answers to 18 common questions about sourcing from China, visiting factories, and working with manufacturers.',
    url: 'https://www.winningadventure.com.au/resources/faq',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/resources/faq',
  },
}

export default function FAQPage() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      <Navbar />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.winningadventure.com.au' },
        { name: 'Resources', url: 'https://www.winningadventure.com.au/resources' },
        { name: 'FAQ', url: 'https://www.winningadventure.com.au/resources/faq' }
      ]} />

      {/* Hero */}
      <div className="py-8 md:py-10 px-4 md:px-12 max-w-[90%] mx-auto mt-8">
        <h1 className="font-serif text-[clamp(1.75rem,5vw,3.5rem)] font-normal leading-[1.15] mb-6 text-navy">
          China Sourcing FAQ
        </h1>
        <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-[800px] mb-4">
          Expert answers to 18 common questions about sourcing from China, visiting factories, and working with manufacturers. Whether you are new to importing or looking to optimise your existing supply chain, these FAQs will help you understand the process.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Learn more about our approach in our <Link href="/services" className="text-amber hover:underline">sourcing services</Link> or <Link href="/about" className="text-amber hover:underline">about us</Link>.
        </p>
      </div>

      {/* FAQ Section */}
      <section className="py-14 px-4 md:px-6">
        <div className="max-w-[800px] mx-auto">
          <FAQ faqs={faqs} />
        </div>
      </section>

      <Footer />
    </>
  )
}
