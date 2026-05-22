'use client'

import { useState, useRef, useEffect } from 'react'
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
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-white py-14 px-8 md:px-20">
      <div
        ref={sectionRef}
        className={`max-w-[640px] mx-auto transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <p className="text-sm font-normal text-navy/50 mb-3">
          Frequently Asked Questions
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] font-semibold text-navy mb-8">
          Everything You Need to Know
        </h2>

        <div className="divide-y divide-navy/10">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => toggleFAQ(idx)}
                className="w-full flex items-center justify-between py-5 text-left cursor-pointer bg-transparent hover:bg-navy/5 transition-colors"
              >
                <span className="font-semibold text-navy text-base pr-6 text-left">
                  {faq.question}
                </span>
                <span className="text-2xl text-navy flex-shrink-0 leading-none">
                  {openIndex === idx ? '−' : '+'}
                </span>
              </button>
              {openIndex === idx && (
                <div className="pb-5 pr-12">
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
