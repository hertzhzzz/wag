# MapLibre GL JS 分析报告

## 1. MapLibre 是否真正免费开源？

**结论: 是的，完全开源，BSD-3-Clause 许可证。**

- MapLibre GL JS 是 Mapbox GL JS 1.x 的开源分支（2020年12月 Mapbox 转向闭源后社区fork）
- 官方仓库: `github.com/maplibre/maplibre-gl-js` (13,660+ commits)
- 许可证: BSD-3-Clause，可免费用于商业项目
- 无任何使用限制或授权费用

---

## 2. MapLibre 支持哪些瓦片源？

**支持多种瓦片来源:**

| 瓦片类型 | 支持情况 |
|---------|---------|
| Vector tiles (MVT) | 原生支持 |
| MapLibre Tile (MLT) | 2026年1月发布的新格式，是MVT的继任者，专为OSM数据优化 |
| Raster tiles | 需要通过第三方层支持 |
| GeoJSON | 支持 |
| WMTS | 支持 |

**免费矢量瓦片源:**
- **OpenMapTiles** - 自托管方案，OpenStreetMap数据
- **Protomaps** - 免费全球矢量瓦片 (`pmtiles` 格式)
- **Maptiler Cloud** - 有免费额度
- **ESRI Vector Basemaps** - 通过 esri-leaflet-vector 插件

---

## 3. MapLibre 是否可以无 API Key 使用？

**结论: 可以，无需 API Key。**

- MapLibre 本身不需要任何 API Key
- 使用开源瓦片源（如 OpenMapTiles、Protomaps）完全免费，无需认证
- 如果使用商业瓦片服务（如 Mapbox、MapTiler），则需要 해당 服务的 API Key

---

## 4. MapLibre vs Leaflet 性能对比

| 维度 | MapLibre GL JS | Leaflet |
|------|---------------|---------|
| 渲染技术 | WebGL (GPU加速) | Canvas/DOM |
| 矢量瓦片 | 原生支持 | 需插件 (maplibre-gl-leaflet) |
| 性能(大数据量) | 优 (GPU加速渲染) | 中 (DOM节点多时卡顿) |
| 包大小 | ~200KB (较大) | ~40KB (较小) |
| 交互复杂度 | 高 (自定义样式丰富) | 中 (依赖插件) |
| 移动端性能 | 优 | 中 |
| 学习曲线 | 较陡 | 平缓 |

**结论**: Leaflet 适合简单场景（少量标记）；MapLibre 适合需要矢量瓦片、高性能、自定义样式的场景。

---

## 5. 生产环境最佳实践

### 安装
```bash
npm install maplibre-gl
```

### 基础使用（无API Key）
```typescript
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      'osm': {
        type: 'vector',
        tiles: ['https://tiles.openmaptiles.org/data/z/{z}/{x}/{y}.pbf'],
      }
    },
    layers: []
  },
  center: [151.2093, -33.8688], // Sydney
  zoom: 10
});

map.addControl(new maplibregl.NavigationControl());
```

### 瓦片源推荐
```javascript
// 方案1: Protomaps (免费,无需注册)
tiles: ['https://tiles.protomaps.com/v3/{z}/{x}/{y}.mvt']

// 方案2: OpenMapTiles (需自托管或付费云服务)
tiles: ['https://api.maptiler.com/tiles/v3/{z}/{x}/{y}.pbf?key=YOUR_KEY']
```

### 添加自定义标记
```javascript
new maplibregl.Marker({ color: '#F59E0B' })
  .setLngLat([151.2093, -33.8688])
  .setPopup(new maplibregl.Popup().setHTML('<h3>Factory</h3>'))
  .addTo(map);
```

### 性能优化
- 使用矢量瓦片替代大量 raster tiles
- 合理设置 `maxZoom` 避免过度加载
- 使用 `cluster` 属性聚合大量标记点

---

## 总结

| 问题 | 答案 |
|------|------|
| 开源免费? | 是，BSD-3-Clause |
| 无API Key? | 是（配合开源瓦片源） |
| 矢量瓦片支持? | 原生支持（MVT + MLT） |
| 性能vs Leaflet? | 优，尤其大数据量和移动端 |
| 生产可用? | 是，已被多家大厂使用 |

**推荐路径**: 如果只需要简单标记地图，Leaflet 足够；如果需要矢量瓦片、自定义样式、高性能，MapLibre 是最佳开源选择。
