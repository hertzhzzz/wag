# Research: Number Marker Patterns for Leaflet

**Date:** 2026-03-21
**File:** `app/components/DirectorySection/DirectoryMapInner.tsx`
**Context:** Displaying factory counts (e.g., "80", "50", "35") on Leaflet map markers

---

## 1. Overview

Displaying numbers on map markers is a common requirement. Based on research across Leaflet ecosystem, Google Maps, Mapbox, and HERE Maps, several reliable patterns emerge.

---

## 2. Pattern Comparison

| Library | Approach | Reliability | Performance |
|---------|----------|-------------|-------------|
| **Leaflet DivIcon** | HTML/CSS inside `L.divIcon` | High | Medium (DOM-heavy) |
| **Leaflet CircleMarker + bindTooltip** | Canvas/DOM tooltip overlay | High | Medium |
| **Leaflet.markercluster** | Built-in cluster count display | Very High | High |
| **Mapbox CircleLayer + SymbolLayer** | Vector tile rendering | Very High | Very High |
| **Google Maps Marker + Label** | `@google/markerwithlabel` library | High | Medium |
| **HERE Map JavaScript API** | `H.map.DomIcon` with custom HTML | High | Medium |

---

## 3. Leaflet DivIcon Pattern (Recommended for Leaflet)

### 3.1 Basic Circle with Number

```javascript
function createNumberMarker(number) {
  const size = 40;
  return L.divIcon({
    className: 'number-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #F59E0B;
        border: 3px solid #0F2D5E;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: #0F2D5E;
        font-family: 'IBM Plex Sans', system-ui, sans-serif;
      ">${number}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
```

### 3.2 Cluster Icon with Count (Leaflet.markercluster)

From `DirectoryMapInner.tsx` lines 114-145:

```javascript
function createClusterIcon(cluster: L.MarkerCluster) {
  const childCount = cluster.getChildCount();
  const size = Math.min(60, 40 + Math.floor(childCount / 2));

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        border: 4px solid #0F2D5E;
        border-radius: 50%;
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
  });
}
```

### 3.3 Factory Badge Pattern (Small Count Overlay)

From `DirectoryMapInner.tsx` lines 59-76:

```javascript
const badgeHtml = isPrimary && factories > 10
  ? `<div style="
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: #0F2D5E;
      color: white;
      font-size: 10px;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #F59E0B;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${factories}</div>`
  : '';
```

---

## 4. Font Sizing Strategies

### 4.1 Dynamic Font Size Based on Number Length

```javascript
function getFontSize(number, baseSize) {
  const digits = String(number).length;
  if (digits <= 2) return baseSize;
  if (digits === 3) return baseSize * 0.75;
  return baseSize * 0.6; // 4+ digits
}

function createScalableNumberMarker(number) {
  const baseSize = 36;
  const fontSize = getFontSize(number, 14);
  const size = Math.max(32, baseSize + (String(number).length - 1) * 4);

  return L.divIcon({
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: #F59E0B;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontSize}px;
      font-weight: 700;
    ">${number}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
```

### 4.2 Cluster Size Based on Count

```javascript
// From DirectoryMapInner.tsx line 116
const size = Math.min(60, 40 + Math.floor(childCount / 2));
const fontSize = size > 44 ? 18 : 14;
```

---

## 5. Known Pitfalls

### 5.1 Text Overflow

| Problem | Solution |
|---------|----------|
| Long numbers overflow circle | Use `overflow: hidden` + `text-overflow: ellipsis` or scale icon |
| Numbers not centered | Use `display: flex` + `align-items: center` + `justify-content: center` |
| Font too large for small markers | Dynamic font sizing based on digit count |

### 5.2 Performance Issues

- **DivIcon DOM overhead**: Each marker is a DOM element. For 1000+ markers, consider:
  - `leaflet.markercluster` for clustering
  - Canvas-based rendering via `leaflet-markers-canvas`
  - Vector tiles with Mapbox GL JS

### 5.3 Z-Index / Layering

- Use `zIndexOffset` option to raise markers above others
- Cluster icons naturally sit above individual markers via Leaflet.markercluster

### 5.4 Retina/High DPI Displays

- Use SVG icons or provide `@2x` image versions
- Font rendering is typically crisp on retina displays when using `px` units

---

## 6. Mapbox Circle + Symbol Pattern

For high-performance needs, Mapbox provides cleaner number rendering:

```javascript
map.addLayer({
  id: 'factories-circle',
  type: 'circle',
  source: 'factories',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['get', 'count'],
      10, 8,
      100, 20,
      500, 30
    ],
    'circle-color': '#F59E0B',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#0F2D5E'
  }
});

// Add number labels
map.addLayer({
  id: 'factories-label',
  type: 'symbol',
  source: 'factories',
  layout: {
    'text-field': ['get', 'count'],
    'text-size': 12,
    'text-font': ['IBM Plex Sans Bold']
  },
  paint: {
    'text-color': '#0F2D5E'
  }
});
```

---

## 7. Google Maps with @googlemaps/markerwithlabel

```javascript
const marker = new google.maps.Marker({
  position: { lat: 35.0, lng: 105.0 },
  map: map,
  label: {
    text: '80', // Number to display
    className: 'marker-label', // Custom CSS class
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#0F2D5E'
  },
  icon: {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 20,
    fillColor: '#F59E0B',
    fillOpacity: 1,
    strokeColor: '#0F2D5E',
    strokeWeight: 3
  }
});
```

---

## 8. HERE Maps DomIcon Pattern

```javascript
const numberIcon = new H.map.DomIcon(
  `<div style="
    width: 40px;
    height: 40px;
    background: #F59E0B;
    border: 3px solid #0F2D5E;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: #0F2D5E;
  ">${count}</div>`
);

const marker = new H.map.Marker(
  { lat: 35.0, lng: 105.0 },
  { icon: numberIcon }
);
```

---

## 9. Current Implementation Analysis

The existing `DirectoryMapInner.tsx` uses a **hybrid approach**:

1. **Factory markers** (lines 52-111): Use SVG factory icon inside `L.divIcon` with optional count badge overlay
2. **Cluster icons** (lines 114-145): Display child count directly in center using flexbox centering
3. **Badge pattern** (lines 59-76): Small pill-shaped count indicator positioned at top-right corner

This is a solid, production-ready pattern. Potential improvements:
- Add dynamic font sizing for cluster counts (3+ digits)
- Consider `leaflet-markercluster` default css override for better control

---

## 10. Recommendations

| Scenario | Recommended Pattern |
|----------|---------------------|
| Small number of markers (< 100) | `L.divIcon` with centered text |
| Many markers with clustering | `Leaflet.markercluster` + `createClusterIcon` pattern |
| High performance (1000+ markers) | Mapbox GL JS or Canvas-based rendering |
| Need SVG icons + numbers | Custom `L.divIcon` with SVG + HTML overlay |
| Platform-native look | Use each platform's recommended approach |

---

## 11. Sources

- Leaflet DivIcon documentation
- Leaflet.markercluster GitHub: https://github.com/Leaflet/Leaflet.markercluster
- Google Maps markerwithlabel: https://github.com/googlemaps/js-markerwithlabel
- Mapbox CircleLayer documentation
- HERE Maps JavaScript API documentation
- CSDN/SegmentFault developer discussions on Leaflet number markers
