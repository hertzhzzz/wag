---
status: awaiting_human_verify
trigger: "Navbar left-top logo icon is very blurry/pixelated. Always blurry since project start, all devices."
created: 2026-04-07T00:00:00.000Z
updated: 2026-04-07T00:00:00.000Z
---

## Current Focus
hypothesis: Using object-none instead of object-contain will render at full intrinsic resolution
test: Changed from width={240} height={48} object-contain to width={300} height={60} object-none
expecting: Logo should display crisply at full 0.5x scaling
next_action: User verify - check if navbar logo is crisp now

## Symptoms
expected: Logo should display crisp and sharp
actual: Logo appears blurry/pixelated
errors: None
reproduction: Always visible on all devices
started: Exists since project start

## Eliminated
- hypothesis: Previous fix cropped the logo incorrectly (removed file, restored original)
  evidence: User said "更加错误了，现在的logo被corp了" - cropping removed too much content
  timestamp: 2026-04-07

- hypothesis: Using fill with responsive sizes causes blur
  evidence: Original fill + sizes approach - object-contain was still blurry
  timestamp: 2026-04-07

- hypothesis: Using explicit width/height with object-contain fixes blur
  evidence: Changed to width={240} height={48} with object-contain - still blurry per user
  timestamp: 2026-04-07

## Evidence
- timestamp: 2026-04-07T00:00:00.000Z
  checked: "app/components/Navbar.tsx line 29-31"
  found: "Image uses `<Image src=\"/logo-nav-trans.png\" fill sizes=\"(max-width: 768px) 200px, 240px\" className=\"object-contain\" priority />`"
  implication: "Uses Next.js Image with fill, object-contain, and responsive sizes"

- timestamp: 2026-04-07T00:00:00.000Z
  checked: "public/logo-nav-trans.png dimensions"
  found: "Image is 480x96 pixels, PNG format with transparency. Content bounds: top=29, bottom=69, left=21, right=458. Actual content only 438x41 pixels."
  implication: "Image has ~40-50% transparent padding around content, reducing effective rendering resolution"

- timestamp: 2026-04-07T00:00:00.000Z
  checked: "Navbar container dimensions"
  found: "Container is 200x40 (mobile) and 240x48 (desktop). Both are 5:1 aspect ratio."
  implication: "Container aspect ratio (5:1) is close to image aspect ratio (480:96 = 5:1)"

- timestamp: 2026-04-07T00:00:00.000Z
  checked: "Blurriness mechanism"
  found: "When image has large transparent areas and uses object-contain, the actual logo content occupies less than the full container. At 40px container height, the 41px content in a 96px image effectively renders at ~17px equivalent height, causing severe pixelation."
  implication: "Root cause: transparent padding reduces effective resolution of displayed content"

- timestamp: 2026-04-07
  checked: "Previous fix attempt"
  found: "Cropped logo-nav-trans.png from 480x96 to 400x80 - THIS WAS WRONG. User confirmed cropped too much content."
  implication: "Do NOT crop the image. Fix must be CSS-only."

- timestamp: 2026-04-07T00:00:00.000Z
  checked: "object-contain behavior"
  found: "object-contain scales to fit within container while maintaining aspect ratio, but the transparent padding means actual logo content may not use full container space"
  implication: "object-contain causes effective resolution loss when transparent padding is present"

- timestamp: 2026-04-07
  checked: "Visual inspection of logo-nav-trans.png"
  found: "Logo text 'WINNING ADVENTURE GLOBAL' spans most of 480px width but only ~40px height in the center 96px image"
  implication: "Transparent padding significantly reduces rendered text resolution when object-contain scales"

- timestamp: 2026-04-07
  checked: "Fix approach"
  found: "Changed to width=300 height=60 with object-none - this renders at full intrinsic resolution without letterboxing"
  implication: "object-none renders at exact pixel scale (0.5x from 480x96 to 240x48)"

## Resolution
root_cause: "object-contain scales to fit container while maintaining aspect ratio, but the transparent padding in logo-nav-trans.png means actual logo content uses less than full container space, causing effective resolution loss"
fix: "Changed from width={240} height={48} object-contain to width={300} height={60} object-none. This renders at full intrinsic resolution without scaling adjustment from object-contain."
verification: "Build passed. Deployed to production. Awaiting user verification."
files_changed: ["app/components/Navbar.tsx"]
---
