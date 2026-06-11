export function resolveReportImagePath(src: string, clientSlug: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }
  return `/reports/${clientSlug}/${src}`
}
