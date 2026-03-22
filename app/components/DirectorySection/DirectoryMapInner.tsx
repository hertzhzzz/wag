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
// Points scale with factory count - more factories = more points
function generateFactoryPoints(
  cityEntry: CityEntry
): Array<{ coords: [number, number]; index: number }> {
  const points: Array<{ coords: [number, number]; index: number }> = []
  // Scale: 1 point per ~4 factories, minimum 2 points per city
  const numPoints = Math.max(2, Math.ceil(cityEntry.factories / 4))

  // Spread radius varies by city size (larger cities = bigger industrial zones)
  const baseRadius = 0.2 + (cityEntry.factories / 100) * 0.4

  for (let i = 0; i < numPoints; i++) {
    // Use deterministic pseudo-random offset based on city + index
    // This ensures consistent positioning across re-renders
    const seed = cityEntry.city.charCodeAt(0) + cityEntry.city.charCodeAt(1) + i * 17
    const angle = (seed % 360) * (Math.PI / 180)
    const radiusFactor = 0.2 + ((seed * 7) % 80) / 100

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

// Custom factory marker icon - high contrast for map visibility
// Amber (#F59E0B) primary with Navy (#0F2D5E) border for maximum contrast
function createFactoryIcon(factories: number, isPrimary = false) {
  // Size scales with factory count for visual hierarchy
  const baseSize = Math.min(40, 24 + Math.floor(factories / 12))
  const size = isPrimary ? baseSize + 4 : baseSize
  const offset = Math.floor(size / 2)

  // Dynamic font size based on digit count and marker size
  const digitCount = factories.toString().length
  let fontSize = Math.floor(size * 0.4)
  if (digitCount === 2) fontSize = Math.floor(size * 0.4)
  if (digitCount === 3) fontSize = Math.floor(size * 0.35)
  if (digitCount >= 4) fontSize = Math.floor(size * 0.28)

  // When showing count inside circle (isPrimary && factories > 10)
  // Show number centered instead of SVG icon
  const showCountInside = isPrimary && factories > 10

  return L.divIcon({
    className: 'factory-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        border: ${isPrimary ? 4 : 3}px solid #0F2D5E;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        box-sizing: border-box;
      ">
        ${showCountInside
          ? `<span style="
              color: white;
              font-size: ${fontSize}px;
              font-weight: 700;
              font-family: 'IBM Plex Sans', system-ui, sans-serif;
              text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5);
              line-height: 1;
            ">${factories}</span>`
          : `<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="width: 50%; height: 50%;">
              <path d="M3 21V7L12 3L21 7V21H15V14H9V21H3Z" fill="#0F2D5E"/>
              <rect x="5" y="8" width="3" height="3" fill="#F59E0B"/>
              <rect x="10" y="8" width="4" height="4" fill="#F59E0B"/>
              <rect x="16" y="8" width="3" height="3" fill="#F59E0B"/>
              <rect x="7" y="13" width="3" height="3" fill="#F59E0B" opacity="0.8"/>
              <rect x="14" y="13" width="3" height="3" fill="#F59E0B" opacity="0.8"/>
            </svg>`
        }
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [offset, offset],
    popupAnchor: [0, -offset],
  })
}

// Cluster icon - high contrast amber with navy border
function createClusterIcon(cluster: L.MarkerCluster) {
  const childCount = cluster.getChildCount()
  const size = Math.min(60, 40 + Math.floor(childCount / 2))

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        border: 4px solid #0F2D5E;
        border-radius: 50%;
        box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6), 0 0 0 4px rgba(245, 158, 11, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
      ">
        <span style="
          color: #0F2D5E;
          font-size: ${size > 44 ? 18 : 14}px;
          font-weight: 700;
          text-shadow: 0 1px 0 rgba(255,255,255,0.3);
        ">${childCount}</span>
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
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: createClusterIcon,
      disableClusteringAtZoom: 10,
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
        const isPrimary = pointIndex === 0
        const marker = L.marker(point.coords, {
          icon: createFactoryIcon(cityEntry.factories, isPrimary),
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
