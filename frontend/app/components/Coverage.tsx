'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

// Must be dynamically imported — Three.js requires browser APIs
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

const CHINA_CITIES = [
  { label: 'Guangdong · Shenzhen', ind: 'Electronics · Tech Hardware',  lat: 22.54,  lng: 114.06 },
  { label: 'Zhengzhou',            ind: 'Machinery · Food Processing',  lat: 34.75,  lng: 113.63 },
  { label: "Xi'an · Shaanxi",      ind: 'Aerospace · Agriculture',      lat: 34.34,  lng: 108.94 },
]
const ADELAIDE = { lat: -34.93, lng: 138.60 }

const ARCS = CHINA_CITIES.map((c, i) => ({
  startLat: c.lat,
  startLng: c.lng,
  endLat:   ADELAIDE.lat,
  endLng:   ADELAIDE.lng,
  color:    ['rgba(245,158,11,0.9)', 'rgba(74,144,217,0.9)'],
  label:    c.label,
  order:    i,
}))

const POINTS = [
  ...CHINA_CITIES.map(c => ({
    lat: c.lat, lng: c.lng,
    size: 0.45, color: '#F59E0B', label: c.label,
  })),
  { lat: ADELAIDE.lat, lng: ADELAIDE.lng, size: 0.65, color: '#4a90d9', label: 'Adelaide, SA' },
]

export default function Coverage() {
  const globeRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait for globe to mount then set camera position over the Asia-Pacific region
    const timer = setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.pointOfView({ lat: 0, lng: 126, altitude: 2.2 }, 0)
        setReady(true)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="bg-[#060e1f] text-[#e8eef7] py-20 px-6 pb-10">
      <div className="max-w-[1100px] mx-auto">
        <p className="text-xs font-semibold tracking-[2px] uppercase text-amber mb-3">
          Global Network
        </p>
        <h2 className="font-serif text-[clamp(28px,4vw,42px)] text-white leading-tight mb-4">
          Connecting China&apos;s Best<br />Suppliers to Australia
        </h2>
        <p className="text-base text-[#8a9ab5] max-w-[520px] mb-10 leading-relaxed">
          Real-time connections across 3 provinces — managed from Adelaide, delivered to your business.
        </p>

        <div className="flex flex-col lg:flex-row items-start gap-10">
          {/* Globe */}
          <div className="flex-1 min-w-0 flex items-center justify-center"
            style={{ height: 420, minWidth: 0 }}>
            <Globe
              ref={globeRef}
              width={480}
              height={420}
              backgroundColor="rgba(0,0,0,0)"
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              atmosphereColor="#4a90d9"
              atmosphereAltitude={0.12}

              // Arcs (flight paths)
              arcsData={ARCS}
              arcColor="color"
              arcAltitude={0.35}
              arcStroke={0.5}
              arcDashLength={0.5}
              arcDashGap={0.15}
              arcDashAnimateTime={2200}

              // City points
              pointsData={POINTS}
              pointColor="color"
              pointAltitude={0.01}
              pointRadius="size"
              pointsMerge={false}

              // Labels
              labelsData={POINTS}
              labelLat="lat"
              labelLng="lng"
              labelText="label"
              labelSize={0.5}
              labelColor={() => '#e8eef7'}
              labelDotRadius={0.3}
              labelAltitude={0.02}
              labelResolution={2}

              // Slow auto-rotation
              enablePointerInteraction={true}
            />
          </div>

          {/* Info list */}
          <div className="flex-shrink-0 w-full lg:w-[280px]">
            {CHINA_CITIES.map((c, i) => (
              <div key={i} className="flex items-start gap-4 py-4 border-b border-white/[0.07]">
                <div className="w-9 h-9 bg-[rgba(245,158,11,0.15)] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber text-[10px] font-bold">
                    {i === 0 ? 'GD' : i === 1 ? 'ZZ' : 'SX'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-0.5">{c.label}</div>
                  <div className="text-xs text-[#8a9ab5]">{c.ind}</div>
                </div>
              </div>
            ))}

            <div className="flex items-start gap-4 py-4">
              <div className="w-9 h-9 bg-[rgba(74,144,217,0.15)] rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#4a90d9] text-[10px] font-bold">AU</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">Adelaide, South Australia</div>
                <div className="text-xs text-[#8a9ab5]">Your local point of contact — bridging both worlds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
