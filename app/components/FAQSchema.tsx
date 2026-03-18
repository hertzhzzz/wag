'use client'

import { faqs as defaultFaqs } from '@/data/faqs'

type FAQItem = {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs?: FAQItem[]
}

export default function FAQSchema({ faqs = defaultFaqs }: FAQSchemaProps) {
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  )
}
