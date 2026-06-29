import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AboutContent from './AboutContent'

import { metadata } from './metadata'

/** Metadata in dedicated file: ./metadata.ts */

export { metadata }

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutContent />
      <Footer />
    </>
  )
}
