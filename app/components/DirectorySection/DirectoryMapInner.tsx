'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { CityEntry } from './types'

interface DirectoryMapInnerProps {
  cities: CityEntry[]
  selectedCity: string | null
  onCitySelect: (city: string) => void
}

// Generate distributed factory points around a city center
// Number of points equals the factory count for that city
function generateFactoryPoints(
  cityEntry: CityEntry
): Array<{ coords: [number, number]; index: number }> {
  const points: Array<{ coords: [number, number]; index: number }> = []
  const numPoints = cityEntry.factories

  // Spread radius: max 0.15 degrees (~15km) to avoid ocean for coastal cities
  // Use smaller radius for coastal cities, larger for inland cities
  const isCoastalCity = ['Shenzhen', 'Dongguan', 'Foshan', 'Guangzhou'].includes(cityEntry.city)
  const baseRadius = isCoastalCity
    ? Math.min(0.15, 0.03 + (cityEntry.factories / 1000))
    : Math.min(0.25, 0.05 + (cityEntry.factories / 500))

  for (let i = 0; i < numPoints; i++) {
    // Deterministic spread: use golden angle for even distribution
    const goldenAngle = 137.508
    const angle = (i * goldenAngle + cityEntry.city.charCodeAt(0) * 10) % 360
    const angleRad = angle * (Math.PI / 180)

    // Concentric rings: pins spread in expanding circles
    const ring = Math.floor(i / 10)
    const radiusFactor = 0.2 + ring * 0.2

    // Calculate offset in degrees
    const latOffset = Math.cos(angleRad) * baseRadius * radiusFactor
    const lngOffset = Math.sin(angleRad) * baseRadius * radiusFactor

    points.push({
      coords: [
        cityEntry.coords[0] + latOffset,
        cityEntry.coords[1] + lngOffset,
      ],
      index: i,
    })
  }

  return points
}

// Custom factory marker icon - Navy (#0F2D5E) pin with white border
function createFactoryIcon(factories: number, isPrimary = false, showCount = false) {
  // Size scales with factory count for visual hierarchy
  const baseSize = Math.min(40, 24 + Math.floor(factories / 12))
  const size = isPrimary ? baseSize + 4 : baseSize
  const offset = Math.floor(size / 2)

  // Always show pin icon, never show factory count
  return L.divIcon({
    className: 'factory-marker',
    html: `
      <div style="
        width: ${size}px !important;
        height: ${size}px !important;
        min-width: ${size}px !important;
        min-height: ${size}px !important;
        background: #0F2D5E;
        border: ${isPrimary ? 3 : 2}px solid #FFFFFF;
        border-radius: 50% !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-sizing: border-box;
        flex-shrink: 0;
        position: relative;
      ">
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="width: 55%; height: 55%; flex-shrink: 0;">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#FFFFFF"/>
              <circle cx="12" cy="9" r="2.5" fill="#0F2D5E"/>
            </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
    popupAnchor: [0, -offset],
  })
}

// Cluster icon - Navy (#0F2D5E) background with white text, no orange glow
function createClusterIcon(cluster: L.MarkerCluster) {
  // Sum factory counts per city — avoid double-counting when multiple marker points
  // belong to the same city. Use a Map to deduplicate by city name.
  // @ts-ignore - cities is custom property added to marker options
  const cityFactories = new Map<string, number>()
  const allChildMarkers = cluster.getAllChildMarkers()
  allChildMarkers.forEach((marker) => {
    // @ts-ignore - city is custom property added to marker options
    const city = marker.options.city as string
    // @ts-ignore - factories is custom property added to marker options
    const factories = marker.options.factories as number
    if (city && factories && !isNaN(factories)) {
      // Only record the first (highest) factory count per city
      if (!cityFactories.has(city)) {
        cityFactories.set(city, factories)
      }
    }
  })

  const totalFactories = Array.from(cityFactories.values()).reduce((sum, f) => sum + f, 0)
  const displayCount = totalFactories > 0 ? totalFactories : cluster.getChildCount()
  const size = Math.min(60, 40 + Math.floor(displayCount / 10))

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px !important;
        height: ${size}px !important;
        min-width: ${size}px !important;
        min-height: ${size}px !important;
        background: #0F2D5E;
        border: 3px solid #FFFFFF;
        border-radius: 50% !important;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
        flex-shrink: 0;
      ">
        <span style="
          color: #FFFFFF;
          font-size: ${size > 44 ? 16 : 13}px;
          font-weight: 700;
          line-height: 1;
        ">${displayCount}</span>
      </div>
    `,
    className: 'factory-cluster',
    iconSize: [size, size],
    iconAnchor: [Math.floor(size / 2), Math.floor(size / 2)],
  })
}

export default function DirectoryMapInner({
  cities,
  selectedCity,
  onCitySelect,
}: DirectoryMapInnerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const zoomRef = useRef<number>(5)
  const showCountRef = useRef<boolean>(true)

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current, {
      center: [35.0, 105.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '&copy; Esri'
    }).addTo(mapRef.current)

    markerClusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 0, // Only cluster markers at exact same coords (same city), never merge cities
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: createClusterIcon,
      disableClusteringAtZoom: 10,
    })

    mapRef.current.addLayer(markerClusterRef.current)

    // Listen for zoom changes to update marker icons
    mapRef.current.on('zoomend', () => {
      if (!mapRef.current) return
      const newZoom = mapRef.current.getZoom()
      zoomRef.current = newZoom
      const newShowCount = newZoom < 12 // Show count only when zoomed out enough

      // Only update if showCount state changed
      if (newShowCount !== showCountRef.current) {
        showCountRef.current = newShowCount
        // Update all marker icons
        markersRef.current.forEach((marker) => {
          // @ts-ignore - factories/city are custom properties
          const factories = marker.options.factories as number
          // @ts-ignore
          const city = marker.options.city as string
          // @ts-ignore
          const isPrimary = marker.options.isPrimary as boolean
          marker.setIcon(createFactoryIcon(factories, isPrimary, newShowCount))
        })
      }
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // Update markers when cities change
  useEffect(() => {
    if (!markerClusterRef.current) return

    // Clear existing markers
    markerClusterRef.current.clearLayers()
    markersRef.current.clear()

    // Add new markers - multiple per city based on factory count
    cities.forEach((cityEntry) => {
      const factoryPoints = generateFactoryPoints(cityEntry)

      const popupContent = `
        <div style="min-width: 180px;">
          <div style="background-color: #0F2D5E; color: white; padding: 8px 12px; margin: -12px -12px 8px -12px; border-radius: 4px 4px 0 0;">
            <strong style="font-size: 14px;">${cityEntry.city}, ${cityEntry.province}</strong>
          </div>
          <p style="color: #0F2D5E; font-size: 13px; margin-bottom: 8px;">
            ${cityEntry.factories} verified factories
          </p>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 12px;">
            ${cityEntry.focus}
          </p>
          <button
            onclick="window.dispatchEvent(new CustomEvent('citySelect', {detail: '${cityEntry.city}'}))"
            style="
              background-color: #F59E0B;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
              width: 100%;
            "
            onmouseover="this.style.backgroundColor='#D97706'"
            onmouseout="this.style.backgroundColor='#F59E0B'"
          >
            View Directory
          </button>
        </div>
      `

      // Create multiple markers per city based on factory count
      factoryPoints.forEach((point, pointIndex) => {
        const isPrimary = pointIndex === 0
        const marker = L.marker(point.coords, {
          icon: createFactoryIcon(cityEntry.factories, isPrimary, showCountRef.current),
          factories: cityEntry.factories,
          city: cityEntry.city,
          isPrimary: isPrimary,
        } as L.MarkerOptions & { factories: number; city: string; isPrimary: boolean })

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: 'custom-popup',
        })

        marker.on('click', () => {
          onCitySelect(cityEntry.city)
        })

        // Only add first marker of city to markersRef for selection
        if (pointIndex === 0) {
          markersRef.current.set(cityEntry.city, marker)
        }
        markerClusterRef.current?.addLayer(marker)
      })
    })
  }, [cities, onCitySelect])

  // Pan to selected city
  useEffect(() => {
    if (!mapRef.current || !selectedCity) return

    const cityEntry = cities.find((c) => c.city === selectedCity)
    if (!cityEntry) return

    mapRef.current.setView(cityEntry.coords, 10, {
      animate: true,
      duration: 0.5,
    })

    const marker = markersRef.current.get(selectedCity)
    if (marker) {
      marker.openPopup()
    }
  }, [selectedCity, cities])

  // Listen for popup button clicks
  useEffect(() => {
    const handleCitySelect = (e: CustomEvent<string>) => {
      onCitySelect(e.detail)
    }

    window.addEventListener('citySelect', handleCitySelect as EventListener)
    return () => {
      window.removeEventListener('citySelect', handleCitySelect as EventListener)
    }
  }, [onCitySelect])

  return (
    <>
      <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
      <style jsx global>{`
        .factory-marker {
          background: transparent !important;
          border: none !important;
        }
        .factory-marker > div {
          box-sizing: border-box !important;
        }
        .factory-cluster {
          background: transparent !important;
          border: none !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(15, 45, 94, 0.2);
          border: 1px solid rgba(15, 45, 94, 0.1);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 0;
        }
        .leaflet-popup-tip {
          background: white;
        }
        /* Cluster hover effect */
        .factory-cluster:hover {
          transform: scale(1.05);
        }
      `}</style>
    </>
  )
}
