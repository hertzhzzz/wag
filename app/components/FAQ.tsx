'use client'

import { useState } from 'react'
import { faqs as defaultFaqs } from '@/data/faqs'

type FAQItem = {
  question: string
  answer: string
}

interface FAQProps {
  faqs?: FAQItem[]
}

export default function FAQ({ faqs = defaultFaqs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-white py-14 px-4 md:px-6">
      <div className="max-w-[800px] mx-auto">
        <p className="text-sm font-normal text-navy/50 mb-3">
          Frequently Asked Questions
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-semibold text-navy mb-8">
          Everything You Need to Know
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-start justify-between p-5 text-left bg-white hover:bg-gray-50/70 transition-colors cursor-pointer border-0 min-h-11 flex-grow"
              >
                <span className="font-semibold text-navy text-base pr-4">
                  {faq.question}
                </span>
                <span className="text-2xl text-navy flex-shrink-0">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 pt-0 flex-grow">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
