'use client'

import { Building2, Factory, Clock, MapPin } from 'lucide-react'

import React, { useEffect, useRef, useState } from 'react'

export default function StatsBar() {
  const [hasAnimated, setHasAnimated] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 py-7 px-4 md:px-12 bg-white border-b border-gray-200">
      <Stat icon={Building2} target={15} suffix="+" label="Industries" animate={hasAnimated} />
      <Stat icon={Factory} target={627} suffix="" label="Verified Suppliers" animate={hasAnimated} />
      <Stat icon={Clock} target={4} suffix="h" label="Response Time" animate={hasAnimated} />
      <Stat icon={MapPin} target={8} suffix="+" label="Chinese Provinces" animate={hasAnimated} />
    </div>
  )
}

function Stat({ icon: Icon, target, suffix, label, animate }: { icon: React.ElementType; target: number; suffix: string; label: string; animate: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animate) return

    const duration = 1200
    const step = Math.ceil(duration / target)
    let current = 0

    const timer = setInterval(() => {
      current++
      setCount(current)
      if (current >= target) clearInterval(timer)
    }, step)

    return () => clearInterval(timer)
  }, [animate, target])

  return (
    <div className="flex flex-row items-center justify-center gap-2 px-4 border-r border-gray-200 last:border-r-0">
      <Icon size={18} className="text-amber flex-shrink-0" />
      <div className="flex flex-col items-center">
        <span className="font-serif text-4xl font-light text-navy leading-none tracking-[-1px]">
          {count}{suffix}
        </span>
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.08em]">
          {label}
        </span>
      </div>
    </div>
  )
}
