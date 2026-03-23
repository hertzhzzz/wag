# Mapbox vs Leaflet: Research Analysis

**Date:** 2026-03-22
**Context:** Factory directory map replacement evaluation

---

## 1. Is Mapbox Free to Use? What Are the Limits?

**Answer: Yes, with significant limits.**

- **Free tier:** 50,000 map loads per month
- A "map load" = one Map object initialized on a webpage
- Session maxes at 12 hours; after that, a new session (and new map load) is counted
- Requires credit card registration even for free tier (no easy way to cap billing)

**Source:** [Mapbox GL JS Pricing](https://docs.mapbox.com/mapbox-gl-js/guides/pricing/)

---

## 2. Pricing After Free Tier

Based on competitor comparison data ([MapTiler](https://www.maptiler.com/mapbox-alternative/)):

| Volume | Mapbox | MapTiler |
|--------|--------|----------|
| 100k map loads | $250 | $175 |
| 500k geocoding requests | $300 | $25 |

Mapbox pricing escalates quickly. For a site with moderate traffic, costs become significant.

**Key concern (from user reports):** Mapbox has no easy way to cap monthly billing. Users report surprise charges with limited control.

---

## 3. Is Mapbox Open Source?

**Partially yes, but with caveats.**

- **mapbox-gl-js** is open source under **BSD-3-Clause License**
- This means the code itself is open and can be modified
- However, to use it meaningfully, you need:
  - Mapbox access token (required since v1.13.0)
  - Mapbox tile services (or equivalent vector tiles)
  - Mapbox style specifications

**The catch:** The library is open source, but the data/services are not. You cannot legally use Mapbox GL JS with Mapbox tiles without a valid access token.

**Alternative approach:** Use Mapbox GL JS with:
- OpenStreetMap-derived vector tiles (requires self-hosting)
- MapTiler tiles
- Custom vector tiles from any MVT-compatible server

---

## 4. Can Mapbox Be Self-Hosted?

**Partial self-hosting is possible, but not fully.**

### What's possible:
1. **Self-host vector tiles** - Generate `.mbtiles` or serve `.pbf` tiles from your own infrastructure using tools like:
   - [Mapbox Studio Classic](https://github.com/mapbox/mapbox-studio) (open source, no longer actively developed)
   - [tippecanoe](https://github.com/mapbox/tippecanoe) for generating vector tiles
   - Self-hosted tile server (e.g., tileserver-gl)

2. **Use Mapbox GL JS without Mapbox services** - The library can technically work with any MVT tiles, but:
   - Token requirement must be bypassed (hack/modification)
   - Must provide your own style JSON
   - Must provide your own tile endpoints

### What's NOT possible:
- Self-hosting Mapbox's actual map services (mapbox:// URLs)
- Using Mapbox's geocoding/search without API calls

### Better alternatives for self-hosted:
- **MapTiler** - Offers self-hosted option with SDK similar to Mapbox
- **OpenMapTiles** - Fully open source tile generation
- **OSM2VectorTiles** - Self-host OSM-derived vector tiles

---

## 5. Advantages vs Disadvantages vs Leaflet

### Mapbox GL JS Advantages

| Factor | Mapbox GL JS | Leaflet |
|--------|--------------|---------|
| **Rendering** | WebGL-powered, smoother for large datasets | Canvas-based, can struggle with 1000+ markers |
| **Visual quality** | Vector tiles = crisp at any zoom | Raster tiles = blur when zoomed |
| **3D support** | Native 3D terrain, extrusions | Limited (via plugins) |
| **Performance** | Better for complex layers | Slower with many markers |
| **Customization** | Style via JSON (Mapbox Style Spec) | CSS-based styling |

### Mapbox GL JS Disadvantages

| Factor | Mapbox GL JS | Leaflet |
|--------|--------------|---------|
| **Cost** | Free tier limited, then $$ | Free (OSM tiles free) |
| **Token required** | Yes (mandatory since v1.13) | No |
| **Learning curve** | Steeper (Style Spec, sources/layers) | Simpler API |
| **Bundle size** | Larger (~400KB vs ~40KB) | Smaller |
| **Plugin ecosystem** | Smaller | Larger, mature |
| **Offline support** | Requires tile caching work | Easier via plugins |
| **Dependencies** | Requires WebGL support | Works everywhere |

### For Factory Directory Map Specifically

**Leaflet is likely sufficient if:**
- Marker count is < 500
- No complex 3D requirements
- Budget is a concern
- Simpler maintenance preferred

**Mapbox GL JS worth considering if:**
- Need smooth performance with many markers (1000+)
- Desire premium visual aesthetics
- Already hitting Leaflet performance limits
- Willing to manage costs

---

## 6. Alternatives Summary

| Option | Cost | Self-Hosted | Notes |
|--------|------|-------------|-------|
| **Leaflet + OSM** | Free | Yes | Best for budget/cost certainty |
| **Leaflet + MapTiler** | ~$175/100k loads | Optional | Lower cost than Mapbox |
| **Mapbox GL JS** | $0-50k, then $250/100k | Partial | Premium quality, token required |
| **MapTiler SDK** | ~$175/100k | Yes | Mapbox-like, better pricing |
| **OpenLayers** | Free | Yes | More complex, similar to Leaflet |

---

## 7. Recommendations

### If cost is primary concern:
**Stay with Leaflet.** Leaflet + OpenStreetMap is free, proven, and sufficient for most directory use cases.

### If you need better performance with many markers:
Consider **Leaflet + a clustered marker approach** (e.g., leaflet.markercluster) before switching to Mapbox.

### If premium visuals are essential:
Consider **MapTiler** as a Mapbox alternative with:
- ~40% lower pricing
- Self-hosted option available
- Similar API design to Mapbox

### If switching to Mapbox GL JS:
Budget for ~$25-50/month at moderate traffic (50k-100k sessions) and monitor usage closely.

---

## Key Sources

- [Mapbox GL JS Pricing Guide](https://docs.mapbox.com/mapbox-gl-js/guides/pricing/)
- [MapTiler Comparison](https://www.maptiler.com/mapbox-alternative/)
- [Mapbox GL JS GitHub](https://github.com/mapbox/mapbox-gl-js)
- [BSD-3-Clause License confirmed](https://zhuanlan.zhihu.com/p/382523702)
