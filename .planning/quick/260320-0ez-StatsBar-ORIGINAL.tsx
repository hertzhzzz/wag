# StatsBar.tsx - ORIGINAL CODE
# Saved: 2026-03-20
# Reason for removal: User requested deletion of body > div.bg-navy section

---

```tsx
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
    <div ref={statsRef} className="bg-navy">
      <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 py-10 md:py-14 px-4 md:px-8">
        <Stat icon={Building2} target={15} suffix="+" label="Industries" animate={hasAnimated} />
        <Stat icon={Factory} target={627} suffix="" label="Verified Suppliers" animate={hasAnimated} />
        <Stat icon={Clock} target={4} suffix="h" label="Response Time" animate={hasAnimated} />
        <Stat icon={MapPin} target={8} suffix="+" label="Chinese Provinces" animate={hasAnimated} />
      </div>
    </div>
  )
}

function Stat({ icon: Icon, target, suffix, label, animate }: { icon: React.ElementType; target: number; suffix: string; label: string; animate: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!animate) return

    const duration = 1500
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
    <div className="flex flex-row items-center justify-center gap-4 px-4 border-r border-white/10 last:border-r-0">
      <div className="w-12 h-12 rounded-lg bg-amber/10 flex items-center justify-center">
        <Icon size={24} className="text-amber" />
      </div>
      <div className="flex flex-col items-start">
        <span className="font-serif text-4xl md:text-5xl font-light text-white leading-none tracking-[-1px]">
          {count}{suffix}
        </span>
        <span className="text-xs font-medium text-white/60 uppercase tracking-[0.12em] mt-1">
          {label}
        </span>
      </div>
    </div>
  )
}
```

---

## Stats shown:
- 15+ Industries
- 627 Verified Suppliers
- 4h Response Time
- 8+ Chinese Provinces
