import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import AboutContent from './AboutContent'
import PersonSchema from '@/components/PersonSchema'
import { buildAndySchema } from '@/lib/schema'

import { metadata } from './metadata'

/** Metadata in dedicated file: ./metadata.ts */

export { metadata }

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <PersonSchema schema={buildAndySchema()} />
      <AboutContent />
      <Footer />
    </>
  )
}
