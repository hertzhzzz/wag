---
status: investigating
trigger: "主页的industries section的图片没有作为背景而是变成单独的元素了"
created: 2026-03-17
updated: 2026-03-17
---

## Current Focus
hypothesis: OptimizedImage applies className to wrapper div, not inner Image, causing object-cover to be lost
test: Analyze OptimizedImage component implementation
expecting: Confirm className is applied to wrong element
next_action: Verify root cause and propose fix

## Symptoms
expected: Images in Industries section should appear as background (filling container with object-cover)
actual: Images appear as separate elements, not filling the container as background
errors: []
reproduction: Visit homepage, scroll to Industries section, observe images
started: After commit 28162b54 (integrate Button and OptimizedImage components)

## Evidence
- timestamp: 2026-03-17
  checked: FeaturedPanel.tsx
  found: Uses OptimizedImage with className="absolute inset-0 w-full h-full object-cover"
  implication: These classes are meant to make image behave as background

- timestamp: 2026-03-17
  checked: OptimizedImage.tsx implementation
  found: "className" is destructured from props and applied ONLY to wrapper div, NOT to inner Image
  implication: The inner Image gets only "transition-opacity duration-500 opacity-0/100", missing object-cover

- timestamp: 2026-03-17
  checked: Git history
  found: Commit 28162b54 migrated from Image to OptimizedImage
  implication: Before migration, Image received className directly and object-cover worked

- timestamp: 2026-03-17
  checked: Other affected files
  found: ResourcesContent.tsx has same pattern (object-cover on className)
  implication: Same bug affects ResourcesContent card backgrounds

## Resolution
root_cause: "OptimizedImage.tsx destructures className and applies it ONLY to the wrapper <div>, not to the inner Next.js <Image>. When className='absolute inset-0 w-full h-full object-cover' is passed, object-cover is applied to the wrapper div (useless) while the inner Image lacks object-cover and doesn't fill the container."
fix: "Modified OptimizedImage to apply className to inner Image: className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}"
files_changed: ["app/components/OptimizedImage.tsx"]
verification: "Build passes. Need human verification to confirm images now render as background in Industries section."
