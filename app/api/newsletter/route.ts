import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

// Lazy load nodemailer to avoid SSR issues
async function getTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local')
  }
  const nodemailer = await import('nodemailer')
  return nodemailer.default.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// CORS configuration
const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au',
  'http://localhost:3000',
  'http://localhost:3001',
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

    // Send email notification to site owner
    try {
      const transporter = await getTransporter()
      await transporter.sendMail({
        from: `"Winning Adventure" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        replyTo: email,
        subject: `New Factory Directory Access Request`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0F2D5E">
            <div style="background:#0F2D5E;padding:24px 32px;">
              <p style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px">Factory Directory Access</p>
              <h1 style="color:#fff;font-size:22px;margin:0">Winning Adventure Global</h1>
            </div>
            <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
              <p style="font-size:14px;line-height:1.6;color:#374151;">
                A new user has requested access to the Factory Directory.
              </p>
              <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:120px;">Email</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><a href="mailto:${email}" style="color:#0F2D5E;">${email}</a></td>
                </tr>
              </table>
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;">
                <a href="mailto:${email}" style="display:inline-block;background:#0F2D5E;color:#fff;padding:10px 24px;font-size:13px;font-weight:600;text-decoration:none;">Reply to User →</a>
              </div>
            </div>
            <p style="font-size:11px;color:#9ca3af;text-align:center;padding:16px;">Winning Adventure Global · 5/54 Melbourne St, North Adelaide SA 5006</p>
          </div>
        `,
      })
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : 'Unknown error'
      console.error('Newsletter email error:', errorMessage)
      // Still return success to user - they can manually follow up
      // But log the error so we know it failed
    }

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
