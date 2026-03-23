# HERE Maps Research Analysis

**Date:** 2026-03-22
**Context:** Evaluating HERE Maps as alternative to current Leaflet/OpenStreetMap setup for factory locations in China

---

## 1. Is HERE Maps Free for Developers?

**Answer:** HERE offers a free tier, but it is **not fully free for commercial use**.

- HERE provides a **Freemium pricing model** with API credits bundled per month
- Specific transaction limits are not publicly disclosed on their marketing pages
- Sign-up required at [platform.here.com](https://platform.here.com) to access API keys and pricing

---

## 2. HERE Pricing Tiers

Based on available information:

| Tier | Description |
|------|-------------|
| **Free/Freemium** | Limited monthly API credits (amount unspecified in public docs) |
| **Pay-as-you-go** | Overage charges after free credits exhausted |
| **Enterprise** | Custom pricing for high-volume commercial use |

**Note:** Direct pricing page (`here.com/platform/pricing`) redirects. Actual limits require account creation to view.

---

## 3. HERE China Map Coverage

### Coverage Quality
- HERE has **strong global coverage** including China
- Data partnerships with Chinese tech companies (Tencent, Baidu) extend coverage
- HERE is used by **70+ automotive brands** with 222M+ vehicles on road using their data
- Shanghai Auto Show 2025: HERE positioned as bridge for Chinese automakers entering global markets

### vs Google/OSM for China

| Provider | China Coverage | Factory Location Accuracy |
|----------|---------------|---------------------------|
| **HERE** | Good (partnerships with Chinese companies) | High (automotive-grade data) |
| **OpenStreetMap** | Moderate (volunteer-driven, gaps in rural areas) | Variable |
| **Google Maps** | Limited/Blocked in China | Moderate |

**Key insight:** HERE's automotive heritage means **road-level accuracy** is strong - important for factory locations in industrial zones.

---

## 4. SDKs and Libraries

### Web SDKs
- **HERE JavaScript API** (v3.x) - Core map rendering
- **HERE REST APIs** - Geocoding, Routing, Search
- **React wrapper packages** available (`react-here-map` on npm)

### Integration Options
```bash
# Via get-js npm package
npm install get-js

# Load HERE maps dynamically
import getJS from "get-js";
getJS([
  'https://js.cit.api.here.com/v3/3.0/mapsjs-core.js',
  'https://js.cit.api.here.com/v3/3.0/mapsjs-service.js',
  'https://js.cit.api.here.com/v3/3.0/mapsjs-ui.js',
  'https://js.cit.api.here.com/v3/3.0/mapsjs-mapevents.js'
])
```

### Mobile SDKs
- HERE SDK for iOS
- HERE SDK for Android
- Flutter support (via third-party)

---

## 5. Free Tier Usage Limits

**Unable to confirm exact limits** from public documentation. Based on industry patterns:

| Limit Type | Typical Range |
|------------|--------------|
| Monthly transactions | 10,000 - 250,000 depending on API |
| Rate limiting | Per-second or per-minute caps |
| Map loads | Cached separately from API calls |

**Recommendation:** Sign up at [platform.here.com](https://platform.here.com) to get exact limits for your use case.

---

## 6. Comparison Summary

| Factor | HERE | OSM/Leaflet | Google Maps |
|--------|------|-------------|-------------|
| **Cost** | Freemium (limits TBD) | Free | ~$200/mo minimum |
| **China coverage** | Good | Moderate | Poor/blocked |
| **API ease-of-use** | Good (docs need account) | Excellent | Excellent |
| **Commercial licensing** | Required above free tier | ODbL license | Required |
| **SDK quality** | High (automotive-grade) | Good | High |

---

## 7. Recommendations for WAG Project

### Pros
- Better China coverage than Google, comparable to OSM
- Automotive-grade road data beneficial for factory locations
- No upfront cost for evaluation

### Cons
- Free tier limits unclear without account creation
- Requires API key management (vs OSM's open tile access)
- Additional dependency vs current Leaflet setup

### Next Steps
1. **Create HERE developer account** at platform.here.com to verify exact free tier limits
2. **Test China coverage** by geocoding known factory addresses in your target regions
3. **Compare tile loading speed** vs current OSM tiles
4. **Consider hybrid approach:** OSM for base tiles, HERE for geocoding/search if OSM accuracy is insufficient

---

## Sources
- HERE Technologies official site (here.com)
- HERE Developer documentation (developer.here.com)
- Industry news: Tencent partnership (2018), Shanghai Auto Show 2025
