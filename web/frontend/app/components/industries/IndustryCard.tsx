'use client'

import { Industry } from './types'

interface IndustryCardProps {
  industry: Industry
  isActive: boolean
  onClick: () => void
}

export default function IndustryCard({ industry, isActive, onClick }: IndustryCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-1 items-center gap-3 px-5 cursor-pointer border-l-[3px] border-transparent transition-all min-h-11 ${
        isActive
          ? 'bg-[rgba(245,158,11,0.12)] border-l-amber'
          : 'hover:bg-[rgba(255,255,255,0.06)]'
      }`}
    >
      <span className={`text-[0.6rem] font-bold tracking-[0.1em] min-w-[18px] ${
        isActive ? 'text-amber' : 'text-[rgba(255,255,255,0.3)]'
      }`}>
        {industry.num}
      </span>
      <span className={`text-[0.82rem] font-medium leading-tight ${
        isActive ? 'text-white' : 'text-[rgba(255,255,255,0.55)]'
      }`}>
        {industry.name}
      </span>
    </div>
  )
}
