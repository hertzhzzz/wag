# Google Maps Platform Pricing Research

**Date:** 2026-03-22
**Purpose:** Evaluate map solutions for WAG B2B website showing factory locations in China

---

## 1. Is Google Maps Free for Small Commercial Use?

**No.** Google Maps Platform is NOT free for commercial use. Key points:

- Uses **pay-as-you-go pricing model** with no free tier for commercial production use
- As of **March 2025**, the previous $200 monthly credit was replaced with **free usage caps per SKU**
- Each SKU (Stock Keeping Unit) provides free billable events monthly, but these are limited

| Plan Type | Price | Included Calls |
|-----------|-------|----------------|
| **Starter** | $100/month | 50,000 calls |
| **Essentials** | $275/month | 100,000 calls |
| **Pro** | $1,200/month | 250,000 calls |

---

## 2. Google Maps Pricing After Free Tier

### Maps JavaScript API (Dynamic Maps) Pricing

| Usage Tier | Cost per 1,000 Loads |
|-----------|---------------------|
| 0 - 100,000 | $7.00 |
| 100,001 - 500,000 | $5.60 |
| 500,001 - 1,000,000 | $4.00 |
| 1,000,001 - 5,000,000 | $2.80 |
| 5,000,000+ | $1.40 |

**Free monthly allowance:** 10,000 loads per month

### Cost Calculation for 100k Monthly Loads

| Scenario | Calculation | Monthly Cost |
|----------|-------------|--------------|
| 100,000 loads (no free tier) | 100 x $7.00 | **$700** |
| 100,000 loads (with 10k free) | 90 x $7.00 | **$630** |

---

## 3. Free Alternatives That Work Like Google Maps

### OpenStreetMap (OSM) - **Recommended**

| Feature | Details |
|---------|---------|
| **Cost** | Completely free (CC BY-SA license) |
| **API Required** | No API key needed for basic tile serving |
| **Commercial Use** | Yes, with attribution required |
| **Customization** | Full styling control via Leaflet/Mapbox GL JS |
| **China Coverage** | Good for major cities, varies for industrial areas |

**How it works:**
- Free tile servers: `tile.openstreetmap.org` (no API key)
- Commercial tile providers (optional): MapTiler, Stadia Maps, Thunder Forest
- Max ~90 requests/sec per IP on OSM servers (suitable for low-medium traffic)

### Mapbox

| Feature | Details |
|---------|---------|
| **Free Tier** | 50,000 map loads/month |
| **Cost after free** | ~$5.00 per 1,000 additional loads |
| **API Key Required** | Yes |
| **China Coverage** | Good globally, includes Chinese labels |

### Other Free/Paid Alternatives

| Provider | Free Tier | Paid Starting |
|----------|-----------|---------------|
| **Stadia Maps** | 100k tiles/month | $29/month after |
| **MapTiler** | 100k tiles/month | ~$11/month after |
| **Thunder Forest** | 50k tiles/month | ~$5/month after |

---

## 4. Cost Comparison for 100k Monthly Map Loads

| Provider | Monthly Cost | Notes |
|----------|--------------|-------|
| **Google Maps** | **$630** | After 10k free credit |
| **Mapbox** | **$250** | First 50k free, ~$5/1k after |
| **Stadia Maps** | **$29** | First 100k free tier |
| **MapTiler** | **$11** | First 100k free tier |
| **OpenStreetMap** | **$0** | Free with attribution |

---

## 5. Google Maps vs OpenStreetMap China Coverage

### Google Maps in China
- **Limited coverage** for many areas due to legal requirements
- Some regions require special licensing
- Factory/industrial area details often outdated
- Satellite imagery restricted

### OpenStreetMap in China
- **Varies significantly** by region
- Major cities (Shanghai, Shenzhen, Guangzhou): Good coverage
- Industrial zones: Depends on local contributor activity
- **Advantage:** Community updates frequently with factory information
- **Note:** Some areas may show outdated satellite imagery

### Recommendation for Factory Locations in China

Given the use case (showing factory locations in China for Australian B2B):

1. **OpenStreetMap is strongly recommended** because:
   - Completely free
   - Better community-driven updates for industrial areas
   - No API key required for basic use
   - Works well with Leaflet (already in use)

2. **Consider hybrid approach:**
   - Use OSM tiles as base map (free)
   - Add custom markers for factory locations
   - Use Google's satellite imagery only for specific locations if needed (paid)

---

## Recommendations for WAG Website

### Current Setup (Leaflet + OSM)
**Keep it.** This is the most cost-effective solution:

```
Cost: $0/month
Coverage: Good for China factory locations
Maintenance: Low (no API keys, no billing setup)
```

### If Higher Traffic Expected (100k+ monthly)
Consider commercial tile providers:

| Provider | 100k loads/month | 500k loads/month |
|----------|------------------|-------------------|
| Stadia Maps | $29 | $129 |
| MapTiler | $11 | $51 |
| Mapbox | $250+ | $750+ |

---

## Key Takeaways

1. **Google Maps is NOT free** - 100k monthly loads costs ~$630/month after free tier
2. **OpenStreetMap with Leaflet is the best free option** - no API key, free for commercial use (with attribution)
3. **China coverage is comparable** between Google and OSM for industrial areas, with OSM having more community-driven updates
4. **Commercial tile providers** (Stadia, MapTiler) offer free tiers that exceed current needs

---

## Sources

- Google Maps Platform Pricing: https://developers.google.com/maps/billing-and-pricing
- OpenStreetMap: https://www.openstreetmap.org
- Mapbox Pricing: https://www.mapbox.com/pricing
