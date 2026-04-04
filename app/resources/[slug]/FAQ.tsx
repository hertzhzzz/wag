'use client'

import { useState } from 'react'
import type { FAQProps } from './types'

export function FAQ({ question, answer }: FAQProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg my-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-[#0F2D5E]">{question}</span>
        <span className={`text-[#F59E0B] text-xl font-bold transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
      </button>
      {isOpen && (
        <div className="p-5 bg-[#f8f9fb] text-gray-700 text-sm leading-relaxed border-t border-gray-200">
          {answer}
        </div>
      )}
    </div>
  )
}
