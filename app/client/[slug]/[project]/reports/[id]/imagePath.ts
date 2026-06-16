/**
 * Resolve a report image path.
 * Relative paths (images embedded in MDX via ![]() syntax) are resolved to
 * the static public/reports/ directory. Absolute paths (ProductCard src) are
 * returned unchanged.
 */
export function resolveReportImagePath(src: string, clientSlug: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }
  return `/reports/${clientSlug}/${src}`
}
