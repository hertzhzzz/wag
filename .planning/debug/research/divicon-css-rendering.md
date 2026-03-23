# Leaflet DivIcon CSS Rendering Architecture

## Executive Summary

Leaflet's `DivIcon` renders custom HTML content via a specific CSS positioning mechanism that uses **negative margins** (not CSS transforms) to offset the icon from its geographic coordinate. Understanding this architecture is critical for aligning badge overlays within circular markers.

---

## 1. DOM Structure Created by DivIcon

When a `Marker` with a `DivIcon` is added to the map, Leaflet creates this DOM hierarchy:

```
leaflet-marker-pane (z-index: 600)
└── div.leaflet-marker-icon.[className]
    └── [your custom html]  (the html option content)
```

**Key files:**
- `/node_modules/leaflet/src/layer/marker/DivIcon.js` (lines 45-63)
- `/node_modules/leaflet/src/layer/marker/Marker.js` (lines 211-281, specifically `_initIcon`)

**DivIcon.createIcon()** creates a `<div>` element:
```javascript
createIcon: function (oldIcon) {
    var div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
        options = this.options;

    if (options.html instanceof Element) {
        empty(div);
        div.appendChild(options.html);
    } else {
        div.innerHTML = options.html !== false ? options.html : '';
    }
    // ...
    this._setIconStyles(div, 'icon');
    return div;
}
```

---

## 2. Default CSS Properties Applied by leaflet.css

**Source:** `/node_modules/leaflet/dist/leaflet.css`

### Critical Styles for DivIcon Containers

```css
/* Line 3-16: All leaflet layer elements */
.leaflet-pane,
.leaflet-marker-icon,
.leaflet-marker-shadow {
    position: absolute;   /* CRITICAL: enables left/top positioning */
    left: 0;
    top: 0;
}

/* Line 42-45: Marker icons are blocks */
.leaflet-marker-icon,
.leaflet-marker-shadow {
    display: block;
}

/* Line 569-572: Default DivIcon styling (can be overridden) */
.leaflet-div-icon {
    background: #fff;
    border: 1px solid #666;
}
```

**Important:** The `.leaflet-div-icon` default class has `background: #fff` and `border: 1px solid #666`. Your custom `className: 'factory-marker'` replaces this default class entirely, so you must provide your own background/border styles.

---

## 3. IconAnchor Positioning Mechanism

### The Core Algorithm (Icon.js lines 124-147)

Leaflet uses **negative margins** to position icons, not CSS transforms:

```javascript
_setIconStyles: function (img, name) {
    var options = this.options;
    var sizeOption = options[name + 'Size'];
    // ...
    var size = point(sizeOption),
        anchor = point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
                size && size.divideBy(2, true));  // Default: center

    img.className = 'leaflet-marker-' + name + ' ' + (options.className || '');

    if (anchor) {
        img.style.marginLeft = (-anchor.x) + 'px';   // NEGATIVE MARGIN
        img.style.marginTop  = (-anchor.y) + 'px';   // NEGATIVE MARGIN
    }
    if (size) {
        img.style.width  = size.x + 'px';
        img.style.height = size.y + 'px';
    }
}
```

### How iconAnchor Works

1. **Geographic coordinate** → converted to **layer point** via `latLngToLayerPoint()`
2. Icon's **top-left corner** is placed at: `layerPoint - iconAnchor`
3. For a 40px circular marker with `iconAnchor: [20, 20]`:
   - The marker's center (20px from top-left) aligns with the geographic coordinate
   - Icon appears centered over the coordinate

**Visual representation:**
```
Layer Point (geographic coordinate projected)
    │
    └─── iconAnchor offset ────┘
         │
    ┌────┴────┐
    │ [20,20] │ ← iconAnchor: this point aligns with geographic coordinate
    │  40x40  │
    └─────────┘
    ↑
    Icon's top-left corner is at: layerPoint - [20,20]
```

---

## 4. Marker Update Cycle (How Icons Move with Map)

**Source:** `Marker.js` lines 201-209 and 308-321

```javascript
update: function () {
    if (this._icon && this._map) {
        var pos = this._map.latLngToLayerPoint(this._latlng).round();
        this._setPos(pos);
    }
}

_setPos: function (pos) {
    if (this._icon) {
        DomUtil.setPosition(this._icon, pos);  // Uses CSS transform or left/top
    }
    // ...
}
```

**DomUtil.setPosition** (DomUtil.js lines 227-239):
```javascript
export function setPosition(el, point) {
    el._leaflet_pos = point;
    if (Browser.any3d) {
        setTransform(el, point);  // translate3d(x, y, 0)
    } else {
        el.style.left = point.x + 'px';
        el.style.top = point.y + 'px';
    }
}
```

**Key insight:** The position `pos` passed to `_setPos` is the **raw layer point** (before applying iconAnchor). The iconAnchor offset is applied separately via **negative margins on the element itself**, not as part of the position calculation.

---

## 5. CRS Interaction with DOM Elements

Leaflet's CRS (Coordinate Reference System) affects **how geographic coordinates are converted to screen points**, but does **not** directly affect DOM element styling.

- `latLngToLayerPoint()` converts lat/lng to layer coordinates
- DOM elements are positioned using **CSS left/top or transform** (pixel values)
- No direct interaction between CRS and CSS properties

**Default CRS:** `L.CRS.EPSG3857` (Web Mercator) - used in your map initialization

---

## 6. Badge Alignment Issue Analysis

### Your Current Badge Code
```javascript
const badgeHtml = `
  <div style="
    position: absolute;
    top: -8px;        // Fixed offset from circle's top edge
    right: -8px;      // Fixed offset from circle's right edge
    background-color: #0F2D5E;
    ...
  ">${factories}</div>
`;
```

### The Problem

For a **circular** marker, the badge positioned at `top: -8px; right: -8px` extends **beyond the circle's boundary**. The distance from the center to the corner of a circle at 45° is:

```
Distance = radius × √2 = (size/2) × 1.414

For size=40: radius=20, distance to corner ≈ 28.28px
For size=48: radius=24, distance to corner ≈ 33.94px
```

The badge at `-8px, -8px` places its top-right corner at approximately **11.3px outside the circle** (for a 40px marker), because:
```
Corner distance from center: 20 × √2 ≈ 28.28px
Badge inner corner from marker center: (20 - 8) × √(1²+1²) ≈ 16.97px
Extension beyond circle: 28.28 - 16.97 ≈ 11.3px
```

### Solutions

**Option A: Scale badge position with marker size (proportional)**
```javascript
// Use percentage-based or proportional offset
const badgeOffset = Math.floor(size * 0.2);  // 20% of size
const badgeHtml = `
  <div style="
    position: absolute;
    top: -${badgeOffset}px;
    right: -${badgeOffset}px;
    ...
  ">${factories}</div>
`;
```

**Option B: Use transform for badge positioning (better approach)**
```javascript
const badgeHtml = `
  <div style="
    position: absolute;
    top: 50%;
    right: 50%;
    transform: translate(50%, -50%);  // Center in parent
    ...
  ">${factories}</div>
`;
```

**Option C: Use negative margin on badge itself**
Since the parent circle is already positioned with negative margins for centering, consider positioning the badge relative to the parent's center using transform instead of absolute coordinates.

---

## 7. Your Current CSS Override Analysis

```css
.factory-marker {
    background: transparent !important;
    border: none !important;
    border-radius: 50% !important;
}
.factory-marker > div {
    border-radius: 50% !important;
}
```

**Issue:** `border-radius: 50%` on the outer container has no effect if the element is not also `overflow: hidden`. However, since your inner div is already `border-radius: 50%` via inline style, this is redundant but harmless.

---

## 8. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Leaflet Map Canvas                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    leaflet-marker-pane                    │  │
│  │                        (z-index: 600)                     │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  div.leaflet-marker-icon.factory-marker             │ │  │
│  │  │  ┌─────────────────────────────────────────────────┐│ │  │
│  │  │  │ position: absolute (from leaflet.css)            ││ │  │
│  │  │  │ margin-left: -20px (iconAnchor offset)         ││ │  │
│  │  │  │ margin-top: -20px (iconAnchor offset)          ││ │  │
│  │  │  │ width: 40px, height: 40px                      ││ │  │
│  │  │  │ ┌───────────────────────────────────────────┐  ││ │  │
│  │  │  │ │ Inner div (your html)                      │  ││ │  │
│  │  │  │ │ position: relative                       │  ││ │  │
│  │  │  │ │ border-radius: 50%                       │  ││ │  │
│  │  │  │ │                                           │  ││ │  │
│  │  │  │ │   ┌─────────┐                             │  ││ │  │
│  │  │  │ │   │ Badge   │ ← position: absolute       │  ││ │  │
│  │  │  │ │   │ top:-8px│   right:-8px               │  ││ │  │
│  │  │  │ │   └─────────┘                             │  ││ │  │
│  │  │  │ └───────────────────────────────────────────┘  ││ │  │
│  │  │  └─────────────────────────────────────────────────┘│ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Positioning Flow:
1. Marker(latlng) → latLngToLayerPoint() → layerPoint [x, y]
2. layerPoint becomes _icon.style.left/top OR transform: translate3d(x, y, 0)
3. iconAnchor [-20, -20] applied as margin-left: -20px; margin-top: -20px
4. Result: Icon center aligns with geographic coordinate
```

---

## Key Takeaways

1. **Leaflet uses negative margins for iconAnchor**, not CSS transforms. The position passed to `_setPos` is the raw layer point, and iconAnchor offsets are applied separately via negative margins on the element.

2. **Default `.leaflet-div-icon` CSS has background and border** which your custom `className: 'factory-marker'` replaces. Ensure your custom styles provide all needed appearance properties.

3. **For circular marker badges, use percentage-based or proportional positioning** rather than fixed pixel offsets to maintain consistent alignment across different marker sizes.

4. **The badge's absolute positioning is relative to the marker div** (which has `position: absolute` from leaflet.css), not to the map container. This is correct behavior but requires careful offset calculation.

5. **To verify badge alignment**, inspect the actual rendered elements in browser DevTools and measure the distances from the badge corners to the circle boundary at different marker sizes.

---

## References

- Source files analyzed:
  - `/node_modules/leaflet/src/layer/marker/DivIcon.js`
  - `/node_modules/leaflet/src/layer/marker/Marker.js`
  - `/node_modules/leaflet/src/layer/marker/Icon.js`
  - `/node_modules/leaflet/src/dom/DomUtil.js`
  - `/node_modules/leaflet/dist/leaflet.css`
