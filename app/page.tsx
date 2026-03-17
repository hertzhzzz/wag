import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CTABand from '@/components/CTABand'
import Hero from './components/Hero'
import StatsBar from './components/StatsBar'
import Industries from './components/industries'
import HowItWorks from './components/HowItWorks'
import FAQ from '@/components/FAQ'
import FAQSchema from '@/components/FAQSchema'

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
