/**
 * Preview / non-production indexability guards.
 * Production www.winningadventure.com.au must remain indexable.
 *
 * Layers that consume this:
 * - proxy.ts (request-time X-Robots-Tag, host-aware)
 * - next.config.js via non-production-robots.cjs (build-time headers)
 * - app/layout.tsx metadata.robots (preview/dev meta)
 * - app/robots.ts (preview disallow-all)
 */

export type DeployEnv = "production" | "preview" | "development" | string | undefined | null

/** True when Vercel marks this deploy as non-production. */
export function isNonProductionDeployEnv(
  vercelEnv: DeployEnv = process.env.VERCEL_ENV,
): boolean {
  const env = String(vercelEnv ?? "")
    .trim()
    .toLowerCase()
  // production (or unset for local) stays indexable unless host says otherwise
  return Boolean(env) && env !== "production"
}

/**
 * Hostnames that are never the production brand domain.
 * Catches public *.vercel.app even if env is mis-set.
 */
export function isNonProductionHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0]
  if (!host) return false
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    return true
  }
  if (host === "vercel.app" || host.endsWith(".vercel.app")) return true
  return false
}

/** Whether responses should send X-Robots-Tag: noindex, nofollow. */
export function shouldSendNoIndexRobotsTag(opts: {
  vercelEnv?: DeployEnv
  hostname?: string | null
}): boolean {
  if (isNonProductionDeployEnv(opts.vercelEnv)) return true
  if (opts.hostname && isNonProductionHostname(opts.hostname)) return true
  return false
}

/** Build-time only: env-based (hostname not available in next.config headers()). */
export function shouldNoindexAtBuildTime(
  vercelEnv: DeployEnv = process.env.VERCEL_ENV,
): boolean {
  return isNonProductionDeployEnv(vercelEnv)
}

export const NOINDEX_ROBOTS_TAG = "noindex, nofollow"

// Aliases kept for call-site clarity
export const NON_PRODUCTION_ROBOTS_TAG = NOINDEX_ROBOTS_TAG
