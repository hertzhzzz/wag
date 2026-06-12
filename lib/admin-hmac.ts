const SECRET = () => process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me"

/**
 * Generate HMAC-SHA256 signature for a token using Web Crypto API.
 * Works in both Edge Runtime and Node.js.
 * Returns "{token}.{hex_signature}"
 */
export async function signToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const secret = encoder.encode(SECRET())

  const key = await crypto.subtle.importKey(
    "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  )

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(token))
  const sigHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  return `${token}.${sigHex}`
}

/**
 * Verify HMAC-SHA256 signature using Web Crypto API.
 * Token format: {uuid}.{hex_signature}
 * Returns the raw token (without signature) if valid, null otherwise.
 */
export async function verifySignedToken(signed: string): Promise<string | null> {
  const parts = signed.split(".")
  if (parts.length !== 2) return null

  const [token, sigHex] = parts
  const encoder = new TextEncoder()
  const secret = encoder.encode(SECRET())

  try {
    const key = await crypto.subtle.importKey(
      "raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    )

    const sigBytes = new Uint8Array(sigHex.length / 2)
    for (let i = 0; i < sigHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(sigHex.substring(i, i + 2), 16)
    }

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(token))
    return valid ? token : null
  } catch {
    return null
  }
}
