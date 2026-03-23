# SVG Rendering in Circular Containers: Browser Behavior Analysis

## Context
Issue with Leaflet DivIcon markers containing inline SVG icons appearing misaligned with their circular container divs.

**File:** `app/components/DirectorySection/DirectoryMapInner.tsx`
**Function:** `createFactoryIcon()` (lines 52-111)

---

## 1. How Browser Renders Inline SVG Inside a Circular Div

### Key CSS Properties in the Code
```css
/* Parent circle div (lines 82-95) */
div {
  width: ${size}px;
  height: ${size}px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* SVG element (line 96) */
svg {
  width: ${Math.floor(size * 0.5)}px;
  height: ${Math.floor(size * 0.5)}px;
  viewBox: "0 0 24 24";
  display: block;
}
```

### Rendering Behavior

**Inline SVG Default Behavior:**
- SVG is an inline replaced element by default
- It has intrinsic dimensions based on `width`, `height`, and `viewBox` attributes
- When `viewBox` is present, the SVG coordinate system maps to the viewport defined by `width` x `height`

**Flexbox Centering with SVG:**
- `align-items: center` centers flex children on the cross axis (vertical)
- `justify-content: center` centers on the main axis (horizontal)
- The SVG's containing block is the parent div's content box
- Flexbox centers the **margin box** of the child element

**Critical Finding: `display: block` on SVG:**
- Adding `display: block` to an inline SVG inside a flex container changes how the browser calculates its dimensions
- Block-level SVG no longer participates in inline formatting context
- However, flexbox still centers it using its margin box dimensions

---

## 2. Root Causes of SVG Offset from Container Center

### A. viewBox Scaling Mismatch

When `viewBox="0 0 24 24"` is combined with explicit pixel dimensions:

```svg
<svg width="20" height="20" viewBox="0 0 24 24">
```

**What happens:**
1. The viewport is 20x20 pixels
2. The viewBox coordinate system is 0-24 in both axes
3. The content is scaled to fit: `min(20/24, 20/24) = 0.833x`
4. Default `preserveAspectRatio="xMidYMid"` centers the scaled content

**Problem:** If the internal content isn't centered within the 24x24 viewBox coordinate space, the visual center will appear offset.

### B. Missing preserveAspectRatio

The code doesn't specify `preserveAspectRatio`, relying on browser default `xMidYMid meet`.

For precise centering, explicit control is needed:
```svg
<svg preserveAspectRatio="xMidYMid meet" ...>
```

### C. SVG Content Not Centered in ViewBox Coordinates

The factory icon paths inside the SVG may not be drawn around the 12,12 center point (the geometric center of 24x24).

**Analysis of the factory icon paths:**
```svg
<path d="M3 21V7L12 3L21 7V21H15V14H9V21H3Z" fill="#0F2D5E"/>
```

- Top of building: y=3
- Bottom of building: y=21
- Center y: (3+21)/2 = 12

The path appears reasonably centered vertically, but the horizontal centering depends on the `L12 3` midpoint and the V21 extents.

### D. `overflow: hidden` Interaction

```css
div {
  overflow: hidden;
}
```

With `overflow: hidden` on the parent:
- Any rendering outside the 20x20 SVG viewport is clipped
- If the SVG is even 1px offset from true center, it appears misaligned
- The clipping boundary is the SVG's viewport edge, not the parent circle

---

## 3. How viewBox Interacts with width/height Attributes

### Coordinate System Mapping

| Attribute | Purpose | Units |
|----------|---------|-------|
| `width` | Viewport width (rendered size) | CSS pixels |
| `height` | Viewport height (rendered size) | CSS pixels |
| `viewBox="min-x min-y width height"` | Internal coordinate system | Abstract units |

### Scaling Calculation

For an SVG with `width="20" height="20" viewBox="0 0 24 24"`:

```
scaleX = viewportWidth / viewBoxWidth = 20 / 24 = 0.833
scaleY = viewportHeight / viewBoxHeight = 20 / 24 = 0.833
```

The content inside is scaled uniformly (if preserveAspectRatio allows).

### Centering Mechanism

With `preserveAspectRatio="xMidYMid"`:
1. Scaled content is placed in the viewport
2. If content aspect ratio != viewport aspect ratio, letterboxing occurs
3. `xMid` = center horizontally in viewport
4. `YMid` = center vertically in viewport

---

## 4. Reliable SVG Centering Techniques

### Technique 1: Absolute Positioning with Transform (Most Reliable)

```css
div {
  position: relative;
}
svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**Why it works:**
- Ignores parent flexbox entirely
- Uses the parent as containing block
- Transform accounts for SVG's own dimensions

### Technique 2: Flexbox with Explicit SVG Sizing

```css
div {
  display: flex;
  align-items: center;
  justify-content: center;
}
svg {
  /* Ensure no display: block */
  width: 50%;
  height: 50%;
}
```

**Issue:** Percentage dimensions on SVG are relative to... the SVG's viewport, not the parent. This can cause circular dependency issues.

### Technique 3: CSS Grid

```css
div {
  display: grid;
  place-items: center;
}
svg {
  /* No width/height needed if using viewBox alone */
}
```

### Technique 4: Remove width/height, Use Only viewBox

```svg
<svg viewBox="0 0 24 24" style="width: 50%; height: 50%;">
```

Using percentage dimensions in CSS rather than attributes avoids scaling conflicts.

### Recommended Fix for DirectoryMapInner.tsx

Replace line 96:
```jsx
// CURRENT (problematic):
<svg width="${Math.floor(size * 0.5)}" height="${Math.floor(size * 0.5)}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">

// FIXED:
<svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="width: 50%; height: 50%; max-width: none;">
```

**Key changes:**
1. Remove explicit `width` and `height` attributes
2. Use CSS `width: 50%` and `height: 50%` (relative to parent circle)
3. Add `preserveAspectRatio="xMidYMid meet"` for explicit centering control
4. Remove `display: block` - unnecessary and potentially problematic

---

## 5. How overflow: hidden on Parent Affects SVG Rendering

### Clipping Behavior

When parent has `overflow: hidden`:
```
+------------------+  <- Parent circle (e.g., 40x40)
|   +---------+    |
|   | SVG 20x20|    |  <- SVG viewport
|   +---------+    |
+------------------+
```

If SVG is 20x20 and parent is 40x40, there's 10px margin on each side. `overflow: hidden` clips anything outside the SVG's 20x20 viewport.

### Potential Issues

1. **Subpixel rendering:** At certain zoom levels, subpixel offset can cause content to appear cut off
2. **Anti-aliasing overflow:** Browser anti-aliasing can render slightly outside bounds
3. **Transform clipping:** If using transforms, content may render outside the expected clip region

### For Circular Clipping

To clip SVG to circle shape, `overflow: hidden` works when combined with `border-radius: 50%` on the parent div. The SVG itself doesn't need to be circular.

---

## Summary of Findings

| Issue | Cause | Solution |
|-------|-------|----------|
| SVG offset from center | `display: block` + flexbox | Remove `display: block` or use absolute positioning |
| SVG content misaligned | viewBox content not geometrically centered | Ensure paths are centered in 24x24 coordinate space |
| Inconsistent rendering | Missing `preserveAspectRatio` | Add explicit `preserveAspectRatio="xMidYMid meet"` |
| Size ambiguity | Percentage vs attribute dimensions | Use CSS percentages, remove attribute dimensions |
| Clipping issues | `overflow: hidden` + subpixel rendering | Ensure SVG is integer-aligned in parent |

---

## Verification Checklist

- [ ] Check if removing `display: block` from SVG improves centering
- [ ] Verify the factory icon paths are truly centered in 24x24 viewBox
- [ ] Test at different map zoom levels
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test at different device pixel ratios (retina vs standard)

---

## References

- [MDN: SVG Attribute: viewBox](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox)
- [MDN: SVG Attribute: preserveAspectRatio](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/preserveAspectRatio)
- [CSS Flexible Box Layout](https://www.w3.org/TR/css-flexbox-1/)
- [CSS Display: Block and Flex](https://www.w3.org/TR/css-display-3/#valdef-display-block)
