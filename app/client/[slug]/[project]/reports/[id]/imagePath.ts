/**
 * Resolve a report image path to the auth-protected API route.
 * Images are served through /api/client/reports/images/{clientSlug}/{path}
 * which validates the client_auth_{slug} session cookie.
 */
export function resolveReportImagePath(src: string, clientSlug: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src
  }
  return `/api/client/reports/images/${clientSlug}/${src}`
}
