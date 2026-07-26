/**
 * CommonJS twin of non-production-robots.ts for next.config.js.
 * Keep logic in sync with lib/non-production-robots.ts (Jest covers the TS source).
 */

function isNonProductionDeployEnv(vercelEnv) {
  const env = String(vercelEnv ?? "")
    .trim()
    .toLowerCase()
  return Boolean(env) && env !== "production"
}

function isNonProductionHostname(hostname) {
  const host = String(hostname || "")
    .toLowerCase()
    .split(":")[0]
  if (!host) return false
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    return true
  }
  if (host === "vercel.app" || host.endsWith(".vercel.app")) return true
  return false
}

function shouldSendNoIndexRobotsTag(opts) {
  const input = opts || {}
  if (isNonProductionDeployEnv(input.vercelEnv)) return true
  if (input.hostname && isNonProductionHostname(input.hostname)) return true
  return false
}

function shouldNoindexAtBuildTime(vercelEnv) {
  return isNonProductionDeployEnv(vercelEnv)
}

const NOINDEX_ROBOTS_TAG = "noindex, nofollow"

module.exports = {
  isNonProductionDeployEnv,
  isNonProductionHostname,
  shouldSendNoIndexRobotsTag,
  shouldNoindexAtBuildTime,
  NOINDEX_ROBOTS_TAG,
  NON_PRODUCTION_ROBOTS_TAG: NOINDEX_ROBOTS_TAG,
}
