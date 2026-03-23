# OpenStreetMap Ecosystem Analysis

Research Date: 2026-03-22
Focus: OSM as Leaflet Replacement for Factory Location Maps

---

## 1. OpenStreetMap Commercial Use Licensing

**Short Answer: Yes, OSM is truly free for commercial use, but with attribution requirements.**

### License Details

- **Data License**: ODbL (Open Database License) v1.0
- **Rendering/Style License**: CC BY-SA 2.0 (for default map style)

### Commercial Use Rights (ODbL)

| Use Case | Permitted? | Conditions |
|----------|------------|------------|
| Display on commercial website | Yes | Attribution required |
| Build commercial products on OSM data | Yes | Share-alike required for derivatives |
| Redistribution of data | Yes | Must attribute OSM, share-alike |
| Build competing map service | Restricted | Cannot use OSM API for this purpose |

### Attribution Requirements

```
Required attribution text:
"© OpenStreetMap contributors"

Required for databases/derivatives:
Must state any changes made to OSM data
```

### Key Legal Points

- **Free to use**: Anyone can use OSM data for commercial purposes without paying
- **Attribution mandatory**: Always display "© OpenStreetMap contributors"
- **Share-alike**: Derivative databases must be released under ODbL
- **No API abuse**: Cannot scrape the main API to build a competing tile/service

---

## 2. Tileserver Options and Costs

### Official OSM Tileservers

| Provider | URL | Cost | Usage Policy |
|----------|-----|------|-------------|
| OpenStreetMap Foundation | tile.openstreetmap.org | Free | Heavy rate limits (~3 req/sec) |
| OpenStreetMap DE | tile.openstreetmap.de | Free | Personal/non-commercial preferred |
| OSM US | tile.openstreetmap.us | Free | Community support |

### Usage Policy Limits (tile.openstreetmap.org)

- **Hard limit**: ~3 requests per second per tile layer
- **Maximum zoom**: 19
- **Fair use**: Heavy usage (>250k tiles/day) requires self-hosting
- **Enforcement**: IP-based throttling, potential blacklisting

### Self-Hosted Options

| Solution | Cost | Complexity | Notes |
|----------|------|-------------|-------|
| TileServer GL | Infrastructure only | Medium | Supports vector tiles, Docker deployment |
| OpenFreeMap | Free (open source) | High | Self-host complete tile pipeline |
| Geofabrik Downloads | Free | Low | Pre-rendered tiles for specific regions |
| Switch2OSM | Infrastructure only | High | Full OSM tile stack |

### Recommended Approach for Production

**For low traffic (< 10k map views/day)**:
- Use official OSM tiles with proper caching
- Add tile caching layer (CloudFlare, etc.)

**For high traffic**:
- Self-host with TileServer GL or OpenFreeMap
- Estimated cost: $20-100/month for VPS with tile serving

---

## 3. OSM-Based Map Libraries

### Comparison Table

| Library | Type | OSM Native | React Support | Vector Tiles | Performance |
|---------|------|------------|---------------|--------------|-------------|
| **Leaflet** | Raster | Yes | react-leaflet | Via plugins | Good |
| **OpenLayers** | Raster/Vector | Yes | ol-mapbox-style | Yes | Good |
| **MapLibre GL** | Vector | Yes | ngx-maplibre-gl | Native | Excellent |
| **Mapbox GL JS** | Vector | Derived | react-map-gl | Native | Excellent |

### Detailed Recommendations

#### 1. Leaflet (Current - if already using)
- **Pros**: Lightweight, simple API, extensive plugins, mobile-friendly
- **Cons**: Raster-only natively, performance degrades with many markers
- **Best for**: Simple maps, few markers, quick implementation

#### 2. MapLibre GL (Recommended for upgrade)
- **Pros**: Open source (BSD), vector tiles, excellent performance, GPU rendering
- **Cons**: More complex than Leaflet, different API
- **Best for**: Production apps needing vector tiles, custom styles
- **Note**: Fork of Mapbox GL after Mapbox went commercial

#### 3. OpenLayers
- **Pros**: Full-featured, WMS support, long history, robust
- **Cons**: Verbose API, larger bundle size
- **Best for**: Enterprise GIS applications

#### 4. React-Leaflet
- **Pros**: React integration, familiar Leaflet API
- **Cons**: Same limitations as Leaflet
- **Best for**: React applications needing simple maps

---

## 4. Limitations of OSM for Production Use

### Data Quality Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Inconsistent coverage | High | Rural/China areas may lack detail |
| Data freshness | Medium | Updates depend on volunteers |
| Building footprints | High | Missing in many areas |
| Indoor mapping | High | Very limited |
| Business POI accuracy | Medium | May be outdated |

### Technical Limitations

1. **Rate Limiting**: Official tiles have strict usage limits
2. **No built-in geocoding**: Must use Nominatim (free but slow) or paid service
3. **Routing limitations**: GraphHopper/OSRM required for turn-by-turn
4. **No satellite imagery**: Only what contributors have added

### Operational Considerations

| Concern | Mitigation |
|---------|------------|
| Tile server reliability | Use multiple tile sources or self-host |
| Data completeness | Supplement with other APIs for China region |
| Performance at scale | Implement tile caching |
| Attribution display | Must be visible on all maps |

---

## 5. China Coverage Considerations

### OSM China Data Status (2024 Research)

**Key Findings from Academic Studies**:

- OSM building data in China has improved significantly since 2012
- Coverage completeness varies dramatically by province
- Major cities (Beijing, Shanghai, Guangzhou) have good coverage
- Rural areas and small cities have substantial gaps
- Research indicates ~60-70% building coverage in tier-1 cities

### Coverage Comparison

| Feature | Google Maps | Baidu Maps | OSM (China) |
|---------|-------------|------------|-------------|
| Roads | Excellent | Good | Moderate |
| Buildings | Good | Good | Poor |
| POIs | Excellent | Excellent | Moderate |
| Satellite | Yes | Yes | No |
| Address data | Good | Excellent | Limited |

### Recommendations for China Factory Maps

1. **Verify your specific factory locations** in OSM before relying on it
2. **Consider hybrid approach**: Use OSM for base map, overlay factory markers from your own data
3. **Supplement with Chinese map services** for local context (Tianditu, Gaode)
4. **Self-host tiles** for China region with better local data sources

---

## 6. Recommendations Summary

### For WAG Factory Location Map

| Factor | Recommendation |
|--------|----------------|
| **Library choice** | Continue with Leaflet OR upgrade to MapLibre GL |
| **Tile source** | Official OSM tiles for low traffic; consider self-hosting for production |
| **China coverage** | Supplement OSM base with local context; verify factory locations |
| **Attribution** | Always display "© OpenStreetMap contributors" |
| **Cost** | Free if using official tiles (within limits); infrastructure cost if self-hosting |

### If Upgrading from Leaflet

**MapLibre GL** offers:
- Vector tiles (smaller downloads, better scaling)
- GPU-accelerated rendering
- Open source (BSD license)
- Active maintenance

**Migration complexity**: Moderate - different API but similar concepts

### If Staying with Leaflet

- Add tile caching layer
- Implement marker clustering for performance
- Consider using multiple tile sources for redundancy

---

## Sources

- OpenStreetMap Wiki: https://wiki.openstreetmap.org
- ODbL License: https://opendatacommons.org/licenses/odbl/
- TileServer GL: https://github.com/maptiler/tileserver-gl
- OpenFreeMap: https://github.com/hyperknot/openfreemap
- MapLibre GL: https://maplibre.org
- Academic research on OSM China coverage: ISPRS International Journal of Geo-Information (2019)
