import { faqs as defaultFaqs } from '@/data/faqs'

type FAQItem = {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs?: FAQItem[]
}

export default function FAQSchema({ faqs = defaultFaqs }: FAQSchemaProps) {
  // FAQPage schema deprecated by Google in May 2024 for rich results
  // Keep FAQ content in HTML for search engines to crawl
  return null
}
