import { NextResponse } from 'next/server'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rate-limit'

// CORS configuration
const ALLOWED_ORIGINS = [
  'https://www.winningadventure.com.au',
  'https://winningadventure.com.au'
]

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

// Validation schema
const enquirySchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  companyName: z.string().min(1, 'Company name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  industry: z.string().min(1, 'Industry is required').max(100),
  customIndustry: z.string().optional(),
  lookingFor: z.string().min(1, 'Please describe what you need').max(5000),
})

// HTML escape function to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

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

  // Parse and validate request body
  const parseResult = enquirySchema.safeParse(await request.json())

  if (!parseResult.success) {
    const response = NextResponse.json(
      { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
      { status: 400 }
    )
    return addCorsHeaders(response, origin)
  }

  const { fullName, companyName, email, phone, industry, customIndustry, lookingFor } = parseResult.data

  // Determine display industry (show customIndustry if "other" is selected)
  const displayIndustry = industry === 'other' && customIndustry ? customIndustry : industry

  // Escape all user inputs for HTML display
  const safeFullName = escapeHtml(fullName)
  const safeCompanyName = escapeHtml(companyName)
  const safeEmail = escapeHtml(email)
  const safePhone = escapeHtml(phone || '')
  const safeIndustry = escapeHtml(displayIndustry)
  const safeLookingFor = escapeHtml(lookingFor)

  try {
    const transporter = await getTransporter()
    await transporter.sendMail({
      from: `"Winning Adventure" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New Sourcing Enquiry — ${safeCompanyName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0F2D5E">
          <div style="background:#0F2D5E;padding:24px 32px;">
            <p style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px">New Sourcing Enquiry</p>
            <h1 style="color:#fff;font-size:22px;margin:0">Winning Adventure Global</h1>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:140px;">Full Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;">${safeFullName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Company</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;">${safeCompanyName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;"><a href="mailto:${safeEmail}" style="color:#0F2D5E;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Phone</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safePhone || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Industry</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeIndustry}</td>
              </tr>
            </table>
            <div style="margin-top:24px;">
              <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 8px;">What They're Looking For</p>
              <div style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${safeLookingFor}</div>
            </div>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e5e7eb;">
              <a href="mailto:${safeEmail}" style="display:inline-block;background:#0F2D5E;color:#fff;padding:10px 24px;font-size:13px;font-weight:600;text-decoration:none;">Reply to ${safeFullName} →</a>
            </div>
          </div>
          <p style="font-size:11px;color:#9ca3af;text-align:center;padding:16px;">Winning Adventure Global · 5/54 Melbourne St, North Adelaide SA 5006</p>
        </div>
      `,
    })

    const response = NextResponse.json({ ok: true })
    return addCorsHeaders(response, origin)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Email error:', errorMessage)
    const response = NextResponse.json(
      { error: errorMessage.includes('credentials not configured')
        ? 'Email service not configured. Please contact the administrator.'
        : 'Failed to send email. Please try again.' },
      { status: 500 }
    )
    return addCorsHeaders(response, origin)
  }
}
