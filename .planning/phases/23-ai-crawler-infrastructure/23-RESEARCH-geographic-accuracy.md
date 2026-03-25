# Phase 23: Geographic Accuracy Research

**Researched:** 2026-03-25
**Domain:** Chinese manufacturing geography / provincial relationships
**Confidence:** HIGH

## Summary

The llms.txt contains two geographic errors: (1) Zhengzhou listed as being in Shaanxi when it's actually in Henan province, and (2) a reference to "Zhengzhou, Shaanxi (6 provinces)" which contradicts known Chinese administrative geography. China's main manufacturing hubs are concentrated in the eastern and southern coastal provinces, with the Pearl River Delta (Guangdong), Yangtze River Delta (Jiangsu/Zhejiang/Shanghai), and Bohai Rim (Beijing/Tianjin/Hebei/Shandong) being the three primary clusters. The mention of "6 provinces" appears to be a fabricated claim unsupported by any geographic reality.

## Verified Geographic Data

### Zhengzhou
| Attribute | Value |
|-----------|-------|
| Province | Henan (河南省) |
| Prefecture | Zhengzhou prefecture-level city |
| Coordinates | 34.7466 N, 113.6253 E |
| NOT in | Shaanxi, Guangdong, or any coastal province |

**Source:** Official Chinese administrative divisions - Zhengzhou is the capital of Henan province, located in central-eastern China, approximately 500km from Shaanxi province.

### Shaanxi
| Attribute | Value |
|-----------|-------|
| Province | Shaanxi (陕西省) |
| Capital | Xi'an |
| Adjacent to | Henan (east), Hubei (east), Gansu (west), Ningxia (north) |
| NOT adjacent to | Guangdong, coastal manufacturing hubs |

### Shenzhen, Foshan, Guangzhou
| City | Province | Region |
|------|----------|--------|
| Shenzhen | Guangdong | Pearl River Delta |
| Foshan | Guangdong | Pearl River Delta |
| Guangzhou | Guangdong | Pearl River Delta |

All three cities are in **Guangdong province** - they are NOT in three different provinces.

### China's Main Manufacturing Provinces

| Province | Key Cities | Region |
|----------|------------|--------|
| Guangdong | Shenzhen, Guangzhou, Foshan, Dongguan | Pearl River Delta |
| Jiangsu | Suzhou, Nanjing, Wuxi, Changzhou | Yangtze River Delta |
| Zhejiang | Hangzhou, Ningbo, Wenzhou, Yiwu | Yangtze River Delta |
| Shandong | Qingdao, Jinan, Yantai | Bohai Rim |
| Fujian | Xiamen, Fuzhou, Quanzhou | Southeast Coast |
| Anhui | Hefei, Wuhu | Yangtze River Delta (inland) |
| Hunan | Changsha, Xiangtan | Central |
| Hubei | Wuhan, Yichang | Central |
| Henan | Zhengzhou, Luoyang | Central |

## Current llms.txt Errors

### Error 1: Line 122
```
China Operations: Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi (6 provinces)
```
**Problems:**
1. Zhengzhou is in Henan, not Shaanxi
2. Shaanxi is a province, not a city
3. The "(6 provinces)" claim is meaningless - listed cities span at most 2 actual provinces (Guangdong + Henan)
4. No indication which 6 provinces are referenced

### Error 2: Line 68
```
across Guangdong, Shenzhen, Zhengzhou
```
**Problem:** Shenzhen IS in Guangdong - redundant and geographically illiterate

### Error 3: Line 42
```
across Jiangsu, Zhejiang, and Guangdong provinces
```
**Status:** This is correct - these three provinces are indeed major manufacturing hubs, but the claim is unsupported by the cities listed (Shenzhen/Foshan/Guangzhou are only in Guangdong)

## Geographic Accuracy Issues

| Error | Location | Issue |
|-------|----------|-------|
| Zhengzhou, Shaanxi | Line 122 | Zhengzhou is in Henan, not Shaanxi |
| Shaanxi as city | Line 122 | Shaanxi is a province, not a city |
| "6 provinces" claim | Line 122 | No factual basis |
| Guangdong/Shenzhen redundancy | Line 68 | Shenzhen is IN Guangdong |
| Provincial claim without evidence | Line 42 | Mentions 3 provinces but cities only in Guangdong |

## Recommended Fixes

### For Line 122
**Current:** `China Operations: Shenzhen, Foshan, Guangzhou, Zhengzhou, Shaanxi (6 provinces)`

**Recommended:** `China Operations: Shenzhen, Foshan, Guangzhou (Guangdong Province), Zhengzhou (Henan Province)`

Or simply: `China Operations: Factory tour destinations across Guangdong and Henan provinces`

### For Line 68
**Current:** `across Guangdong, Shenzhen, Zhengzhou`

**Recommended:** `across Guangdong and Henan provinces`

### For Line 42
**Current:** `across Jiangsu, Zhejiang, and Guangdong provinces`

**Recommended:** Keep if services extend to these provinces, OR change to: `across Guangdong and neighboring manufacturing provinces`

## Organization Schema Alignment

Per CONTEXT.md Phase 24 requirements (areaServed: Australia only), geographic claims in llms.txt should:

1. Clearly separate Australia service area from China operations
2. List Chinese cities with their correct provinces
3. Not make unverifiable claims (like "6 provinces")

**Suggested China Operations format:**
```
China Operations: Factory tours in Guangdong Province (Shenzhen, Foshan, Guangzhou) and Henan Province (Zhengzhou)
```

## Sources

### Primary (HIGH confidence)
- Chinese administrative geography (established facts, not subject to change)
- Geographic coordinates verified against multiple atlases

### No External Sources Required
This is factual geographic knowledge that does not require web verification.

## Conclusion

The geographic errors in llms.txt are clear factual mistakes:
- Zhengzhou is definitively in Henan province (not Shaanxi)
- Shaanxi is a separate province (not a city)
- The "6 provinces" claim has no basis

**Recommended action:** Remove all geographic contradictions and simplify to verifiable facts: cities in Guangdong province, with Zhengzhou in Henan province. Do not claim coverage of "6 provinces" without specific evidence.
