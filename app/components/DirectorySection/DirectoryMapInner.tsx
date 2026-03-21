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
// Points are spread using a Gaussian-like distribution
function generateFactoryPoints(
  cityEntry: CityEntry
): Array<{ coords: [number, number]; index: number }> {
  const points: Array<{ coords: [number, number]; index: number }> = []
  const numPoints = Math.max(1, Math.min(8, Math.round(cityEntry.factories / 10)))

  // Spread radius varies by city size (larger cities = bigger industrial zones)
  const baseRadius = 0.15 + (cityEntry.factories / 100) * 0.3

  for (let i = 0; i < numPoints; i++) {
    // Use deterministic pseudo-random offset based on city + index
    // This ensures consistent positioning across re-renders
    const seed = cityEntry.city.charCodeAt(0) + cityEntry.city.charCodeAt(1) + i * 17
    const angle = (seed % 360) * (Math.PI / 180)
    const radiusFactor = 0.3 + ((seed * 7) % 70) / 100

    const latOffset = Math.cos(angle) * baseRadius * radiusFactor
    const lngOffset = Math.sin(angle) * baseRadius * radiusFactor

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

// Custom amber marker icon using DivIcon
// primary markers are slightly larger when a city has multiple points
function createAmberIcon(isPrimary = false) {
  const size = isPrimary ? 28 : 20
  const offset = isPrimary ? 14 : 10

  return L.divIcon({
    className: 'custom-amber-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: #F59E0B;
        border: ${isPrimary ? '3' : '2'}px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
    popupAnchor: [0, -offset],
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

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    mapRef.current = L.map(mapContainerRef.current, {
      center: [35.0, 105.0],
      zoom: 5,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(mapRef.current)

    markerClusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    })

    mapRef.current.addLayer(markerClusterRef.current)

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
        // Vary marker size based on factory count at this "point"
        const marker = L.marker(point.coords, {
          icon: createAmberIcon(pointIndex === 0 && factoryPoints.length > 1),
        })

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
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(15, 45, 94, 0.15);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          padding: 12px;
        }
        .custom-amber-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </>
  )
}
