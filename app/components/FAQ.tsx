'use client'

import { useState } from 'react'
import { faqs } from '@/data/faqs'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-white py-20 px-4 md:px-6">
      <div className="max-w-[800px] mx-auto">
        <p className="uppercase tracking-[0.12em] text-xs font-semibold text-[#6b8fa8] mb-3">
          Frequently Asked Questions
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-semibold text-navy mb-10">
          Everything You Need to Know
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors cursor-pointer border-0 min-h-11"
              >
                <span className="font-semibold text-navy text-base pr-4">
                  {faq.question}
                </span>
                <span className="text-2xl text-navy flex-shrink-0">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 pt-0">
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
