'use client'

import dynamic from 'next/dynamic'

const DirectoryMapInner = dynamic(() => import('./DirectoryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-navy/5 animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-navy/40 text-sm">Loading map...</span>
    </div>
  ),
})

interface DirectoryMapProps {
  cities: import('./types').CityEntry[]
  selectedCity: string | null
  onCitySelect: (city: string) => void
}

export default function DirectoryMap(props: DirectoryMapProps) {
  return <DirectoryMapInner {...props} />
}
