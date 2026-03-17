import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Industries from './components/industries'
import HowItWorks from './components/HowItWorks'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'China Sourcing Australia | Factory Tours & Supplier Verification',
  description: 'Winning Adventure Global helps Australian businesses source from China with factory tours, supplier verification, and end-to-end procurement support. Based in Adelaide.',
  keywords: ['china sourcing', 'china sourcing australia', 'factory visit china', 'china sourcing adelaide', 'sourcing trip china', 'china factory tour', 'supplier verification china'],
  openGraph: {
    title: 'China Sourcing Australia | Factory Tours & Supplier Verification',
    description: 'Winning Adventure Global helps Australian businesses source from China with factory tours, supplier verification, and end-to-end procurement support. Based in Adelaide.',
    url: 'https://www.winningadventure.com.au/',
    siteName: 'Winning Adventure Global',
  },
  alternates: {
    canonical: 'https://www.winningadventure.com.au/',
  },
}

export default function Home() {
  return (
    <>
      <Navbar />
      <FAQSchema />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Industries />
      <FAQ />
      <CTABand />
      <Footer />
    </>
  )
}
