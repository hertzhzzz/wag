# MarkerClusterGroup iconCreateFunction Architecture Analysis

## Overview

This document analyzes how `leaflet.markercluster` creates and renders cluster icons through the `iconCreateFunction` mechanism.

## 1. How MarkerClusterGroup.iconCreateFunction Works Internally

### Initialization Flow

When a `MarkerClusterGroup` is created with an `iconCreateFunction`:

```typescript
L.markerClusterGroup({
  iconCreateFunction: createClusterIcon,
  // ...
})
```

The function is stored in `options.iconCreateFunction` (MarkerClusterGroup.js line 9, 54-56).

### Icon Creation "Cludge" Pattern

MarkerCluster uses a clever proxy pattern. The `L.MarkerCluster` class **pretends to be an Icon** to integrate with Leaflet's rendering pipeline:

```javascript
// MarkerCluster.js lines 1-7
initialize: function (group, zoom, a, b) {
  L.Marker.prototype.initialize.call(this, a ? (a._cLatLng || a.getLatLng()) : new L.LatLng(0, 0),
      { icon: this, pane: group.options.clusterPane });
  // ...
}
```

Key points:
- `MarkerCluster` extends `L.Marker`
- When initialized, it passes `icon: this` (itself) as the icon option
- This means Leaflet's Marker rendering calls `cluster.createIcon()` which delegates to the `iconCreateFunction`

### The createIcon "Cludge"

```javascript
// MarkerCluster.js lines 93-99
createIcon: function () {
  if (this._iconNeedsUpdate) {
    this._iconObj = this._group.options.iconCreateFunction(this);
    this._iconNeedsUpdate = false;
  }
  return this._iconObj.createIcon();
}
```

**Flow:**
1. Leaflet's `Marker.setIcon()` calls `cluster.createIcon()`
2. MarkerCluster delegates to the `iconCreateFunction` passed to MarkerClusterGroup
3. The result is cached in `_iconObj`
4. `createIcon()` returns the actual DOM element by calling `this._iconObj.createIcon()`

## 2. DOM Structure Created for Cluster Icons

### Default DOM Structure (from _defaultIconCreateFunction)

```javascript
// MarkerClusterGroup.js lines 821-834
_defaultIconCreateFunction: function (cluster) {
  var childCount = cluster.getChildCount();
  var c = ' marker-cluster-';
  if (childCount < 10) {
    c += 'small';
  } else if (childCount < 100) {
    c += 'medium';
  } else {
    c += 'large';
  }
  return new L.DivIcon({
    html: '<div><span>' + childCount + '</span></div>',
    className: 'marker-cluster' + c,
    iconSize: new L.Point(40, 40)
  });
}
```

**Generated DOM:**
```html
<div class="marker-cluster marker-cluster-small">  <!-- or medium/large -->
  <div>
    <span>5</span>
  </div>
</div>
```

### Custom DOM Structure (from DirectoryMapInner.tsx)

The WAG implementation creates:

```javascript
// DirectoryMapInner.tsx lines 118-145
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
```

**Generated DOM:**
```html
<div class="factory-cluster leaflet-marker-icon">
  <div style="width: 48px; height: 48px; background: linear-gradient(...); border: 4px solid #0F2D5E; border-radius: 50%; ...">
    <span style="color: #0F2D5E; font-size: 14px; font-weight: 700; ...">5</span>
  </div>
</div>
```

### How DivIcon Creates the DOM

```javascript
// leaflet-src.js lines 11078-11096
createIcon: function (oldIcon) {
  var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
      options = this.options;

  if (options.html instanceof Element) {
    empty(div);
    div.appendChild(options.html);
  } else {
    div.innerHTML = options.html !== false ? options.html : '';
  }

  if (options.bgPos) {
    var bgPos = toPoint(options.bgPos);
    div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px';
  }
  this._setIconStyles(div, 'icon');

  return div;
}
```

## 3. How Cluster Icon Gets Positioned Relative to Child Markers

### Cluster Center Calculation

The cluster center is stored in `_cLatLng`:

```javascript
// MarkerCluster.js lines 135-140
_setClusterCenter: function (child) {
  if (!this._cLatLng) {
    // when clustering, take position of the first point as the cluster center
    this._cLatLng = child._cLatLng || child._latlng;
  }
}
```

### Weighted Average Position

```javascript
// MarkerCluster.js lines 161-209
_recalculateBounds: function () {
  // ...calculates latSum and lngSum...

  // For child markers
  latSum += childLatLng.lat;
  lngSum += childLatLng.lng;

  // For child clusters (weighted by count)
  latSum += childLatLng.lat * childCount;
  lngSum += childLatLng.lng * childCount;

  this._latlng = this._wLatLng = new L.LatLng(latSum / totalCount, lngSum / totalCount);
}
```

The final cluster position (`_latlng`) is the **weighted average** of all child positions.

### IconAnchor and Positioning

When creating the icon, `iconAnchor` determines where the icon is positioned relative to the coordinate:

```javascript
// leaflet-src.js lines 7434-7443
var anchor = toPoint(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
        size && size.divideBy(2, true));

if (anchor) {
  img.style.marginLeft = (-anchor.x) + 'px';
  img.style.marginTop  = (-anchor.y) + 'px';
}
```

**For a 48px cluster icon with `iconAnchor: [24, 24]`:**
- The icon's top-left corner is offset by -24px margin-left and -24px margin-top
- This centers the 48x48 icon on the coordinate point

## 4. CSS Styling Applied by MarkerCluster

### MarkerCluster.css (Required for all iconCreateFunction implementations)

```css
.marker-cluster-small {
  background-color: rgba(181, 226, 140, 0.6);
}
.marker-cluster-small div {
  background-color: rgba(110, 204, 57, 0.6);
}
/* Similar for medium and large */

.marker-cluster {
  background-clip: padding-box;
  border-radius: 20px;
}
.marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;
  text-align: center;
  border-radius: 15px;
  font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
}
.marker-cluster span {
  line-height: 30px;
}
```

### MarkerCluster.Default.css (Animation transitions)

```css
.leaflet-cluster-anim .leaflet-marker-icon,
.leaflet-cluster-anim .leaflet-marker-shadow {
  -webkit-transition: -webkit-transform 0.3s ease-out, opacity 0.3s ease-in;
  -moz-transition: -moz-transform 0.3s ease-out, opacity 0.3s ease-in;
  -o-transition: -o-transform 0.3s ease-out, opacity 0.3s ease-in;
  transition: transform 0.3s ease-out, opacity 0.3s ease-in;
}
```

### Leaflet Marker Icon Base Classes

The `_setIconStyles` function adds these classes:

```javascript
img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');
```

So for cluster icons: `class="leaflet-marker-icon factory-cluster"`

### Custom CSS in DirectoryMapInner

```css
.factory-cluster {
  background: transparent !important;
  border: none !important;
}
.leaflet-cluster-anim .leaflet-marker-icon,
.leaflet-cluster-anim .leaflet-marker-shadow {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
```

## 5. Z-Index and Stacking Order

### Leaflet's Pane System

MarkerCluster uses the `clusterPane` option (defaults to `markerPane`):

```javascript
// MarkerClusterGroup.js line 10
clusterPane: L.Marker.prototype.options.pane,
```

Leaflet panes have a z-index hierarchy:

```css
.leaflet-pane {
  z-index: 400; /* container */
}
.leaflet-map-pane {
  z-index: 400;
}
.leaflet-tooltip-pane {
  z-index: 650;
}
.leaflet-popup-pane {
  z-index: 650;
}
.leaflet-marker-pane {
  z-index: 600; /* markers and clusters */
}
.leaflet-shadow-pane {
  z-index: 700;
}
.leaflet-overlay-pane {
  z-index: 400;
}
.leaflet-top-pane {
  z-index: 650;
}
```

### Z-Index Within markerPane

**Individual markers** use:
- `z-index` via `zIndexOffset` option (default 0)
- Higher zIndexOffset = rendered on top

**Cluster icons** are rendered as regular markers but:
- They share the same `markerPane` as individual markers
- No explicit z-index is set on cluster icons by default
- Stacking order is determined by DOM order (later added = on top)

### Cluster vs Marker Stacking

When clustering occurs:
1. Individual markers are removed from `markerPane`
2. Cluster icon is added to `markerPane` in their place
3. On zoom-out, children hide (`clusterHide()`) and cluster shows (`clusterShow()`)

```javascript
// MarkerCluster.js lines 229-232
if (m._icon) {
  m._setPos(center);
  m.clusterHide();
}
```

## Key Architectural Insights

### 1. Delegation Pattern
MarkerCluster doesn't create icons itself - it delegates to `iconCreateFunction` which returns a standard Leaflet Icon (typically DivIcon).

### 2. Icon Caching
`_iconObj` caches the icon instance, but `createIcon()` is called every time Leaflet needs the DOM element (allows for icon reuse).

### 3. The clusterPane Option
By default, cluster icons use the same `markerPane` as individual markers, meaning they render at the same z-level but in the same DOM container.

### 4. iconAnchor is Critical
The `iconAnchor` option in DivIcon determines how the icon is centered on the coordinate. For circular icons, this should be `size / 2, size / 2`.

### 5. CSS Class Inheritance
Custom CSS classes (like `factory-cluster`) are **added** to Leaflet's base classes (`leaflet-marker-icon`), not replacements.

## Alignment Issue Root Cause Analysis

Given the WAG implementation in DirectoryMapInner.tsx, potential alignment issues stem from:

1. **iconAnchor mismatch**: If the calculated `size` in `createClusterIcon` doesn't match the actual rendered size due to box-sizing or padding, the iconAnchor `[size/2, size/2]` will be wrong.

2. **CSS box-model**: The inner `<div>` in the cluster icon has explicit `width` and `height`, but these are set via inline styles. The outer div from DivIcon has no explicit size styling applied by MarkerCluster (since `factory-cluster` sets `background: transparent` and `border: none`).

3. **No outer div sizing**: The `iconSize: [size, size]` on DivIcon sets the outer container size, but if the inner HTML doesn't match, alignment issues occur.

4. **Border box calculation**: With `border: 4px solid` on the inner div, the total visual size exceeds the inner content size. The icon needs to account for border width in its sizing.

## Research Sources

- `/Users/mark/Projects/wag/node_modules/leaflet.markercluster/src/MarkerClusterGroup.js`
- `/Users/mark/Projects/wag/node_modules/leaflet.markercluster/src/MarkerCluster.js`
- `/Users/mark/Projects/wag/node_modules/leaflet.markercluster/dist/MarkerCluster.css`
- `/Users/mark/Projects/wag/node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css`
- `/Users/mark/Projects/wag/node_modules/leaflet/dist/leaflet-src.js` (DivIcon, _setIconStyles)
- `/Users/mark/Projects/wag/app/components/DirectorySection/DirectoryMapInner.tsx`
