import crypto from "crypto"

const SECRET = () => {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error("ADMIN_SESSION_SECRET not set")
  return secret
}

/** Sign token with HMAC-SHA256. Returns "{token}.{hex_signature}" */
export async function signToken(token: string): Promise<string> {
  const hmac = crypto.createHmac("sha256", SECRET()).update(token).digest("hex")
  return `${token}.${hmac}`
}

/** Verify HMAC-SHA256 signature. Returns raw token if valid, null otherwise. */
export async function verifySignedToken(signed: string): Promise<string | null> {
  const parts = signed.split(".")
  if (parts.length !== 2) return null

  const [token, sig] = parts
  const expected = crypto.createHmac("sha256", SECRET()).update(token).digest("hex")

  try {
    if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return token
    }
  } catch { /* length mismatch */ }
  return null
}
