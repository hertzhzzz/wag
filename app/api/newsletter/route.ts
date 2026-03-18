import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

// CORS configuration
const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

// CORS preflight handler
export async function OPTIONS() {
  const origin = 'https://www.winningadventure.com.au'
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Helper to check origin and add CORS headers
function addCorsHeaders(response: NextResponse, origin: string): NextResponse {
  if (ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  }
  return response
}

export async function POST(request: Request) {
  // CORS origin check
  const origin = request.headers.get('origin') || ''
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Origin not allowed' },
      { status: 403 }
    )
  }

  // Rate limiting - get IP from headers or fallback
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  if (!(await checkRateLimit(ip))) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    )
    return addCorsHeaders(response, origin)
  }
  try {
    const { email } = await request.json()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const response = NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
      return addCorsHeaders(response, origin)
    }

    // TODO: Integrate with email service (e.g., Mailchimp, ConvertKit, Resend)
    // For now, just log the subscription
    console.log('Newsletter subscription:', email)

    const response = NextResponse.json({ success: true })
    return addCorsHeaders(response, origin)
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    const response = NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
