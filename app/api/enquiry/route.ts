import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { enquirySchema } from '@/lib/enquiry-schema'
import {
  pathIntentLabel,
  timelineLabel,
  isSubmittedPathIntent,
  isTimeline,
  budgetRangeLabel,
  orderTypeLabel,
  isBudgetRange,
  isOrderType,
} from '@/lib/enquiry-qualification'
import { randomUUID } from 'crypto'

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

  const {
    fullName,
    email,
    phone,
    company,
    industry,
    lookingFor,
    sourcePath,
    pathIntent,
    timeline,
    budget,
    orderType,
  } = parseResult.data
  const enquiryId = `enq_${randomUUID()}`

  const pathIntentDisplay = isSubmittedPathIntent(pathIntent)
    ? pathIntentLabel(pathIntent)
    : ''
  const timelineDisplay = isTimeline(timeline)
    ? timelineLabel(timeline)
    : ''
  const budgetDisplay = isBudgetRange(budget)
    ? budgetRangeLabel(budget)
    : ''
  const orderTypeDisplay = isOrderType(orderType)
    ? orderTypeLabel(orderType)
    : ''

  // Escape all user inputs for HTML display
  const safeFullName = escapeHtml(fullName)
  const safeEmail = escapeHtml(email)
  const safePhone = escapeHtml(phone || '')
  const safeCompany = escapeHtml(company || '')
  const safeIndustry = escapeHtml(industry || '')
  const safeLookingFor = escapeHtml(lookingFor)
  const safeSourcePath = escapeHtml(sourcePath || '')
  const safeEnquiryId = escapeHtml(enquiryId)
  const safePathIntent = escapeHtml(pathIntentDisplay)
  const safeTimeline = escapeHtml(timelineDisplay)
  const safeBudget = escapeHtml(budgetDisplay)
  const safeOrderType = escapeHtml(orderTypeDisplay)

  try {
    const transporter = await getTransporter()
    await transporter.sendMail({
      from: `"Winning Adventure Global Pty Ltd" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      cc: 'andy@winningadventure.com.au',
      replyTo: email,
      subject: `New Sourcing Enquiry — ${safeFullName}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0F2D5E">
          <div style="background:#0F2D5E;padding:24px 32px;">
            <p style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px">New Sourcing Enquiry</p>
            <h1 style="color:#fff;font-size:22px;margin:0">Winning Adventure Global Pty Ltd</h1>
          </div>
          <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:140px;">Enquiry ID</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-family:monospace;">${safeEnquiryId}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Full Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-weight:600;">${safeFullName}</td>
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
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Company</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeCompany || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Budget</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeBudget || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Order Type</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeOrderType || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Industry</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeIndustry || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Path Intent</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safePathIntent || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Timeline</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;">${safeTimeline || '—'}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Source Path</td>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;font-size:14px;font-family:monospace;">${safeSourcePath || '—'}</td>
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

    // Auto-reply to customer — failure does not block the main response
    try {
      await transporter.sendMail({
        from: `"Winning Adventure Global Pty Ltd" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `Thank you for your enquiry — Winning Adventure Global`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#0F2D5E">
            <div style="background:#0F2D5E;padding:24px 32px;">
              <p style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 4px">Enquiry Received</p>
              <h1 style="color:#fff;font-size:22px;margin:0">Winning Adventure Global Pty Ltd</h1>
            </div>
            <div style="padding:32px;border:1px solid #e5e7eb;border-top:none;">
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Hi ${safeFullName},</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">Thank you for reaching out to Winning Adventure Global.</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">We have received your sourcing enquiry <span style="font-family:monospace;font-size:13px;background:#f3f4f6;padding:2px 6px;border-radius:3px;">${safeEnquiryId}</span> and a member of our team will be in touch <strong>within 4 hours</strong> during business hours (ACST, Mon–Fri).</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 16px;">In the meantime, if you have any additional details or documents to share, feel free to reply directly to this email.</p>
              <p style="font-size:15px;line-height:1.7;margin:0 0 24px;">If you'd like to schedule a call, you're welcome to book a time directly:</p>
              <div style="margin-bottom:28px;">
                <a href="https://calendly.com/winningadventure/30min" style="display:inline-block;background:#0F2D5E;color:#fff;padding:10px 24px;font-size:13px;font-weight:600;text-decoration:none;">Book a Call →</a>
              </div>
              <div style="border-top:1px solid #e5e7eb;padding-top:20px;font-size:14px;line-height:1.6;">
                <p style="margin:0;">Kind regards,</p>
                <p style="margin:4px 0 0;"><strong>Mark He</strong> (Zhe He）</p>
                <p style="margin:2px 0 0;font-style:italic;">Managing Director — Australia Office</p>
                <p style="margin:2px 0 0;">M: 0416 588 198</p>
                <p style="margin:2px 0 0;">E: <a href="mailto:mark@winningadventure.com.au" style="color:#0F2D5E;">mark@winningadventure.com.au</a></p>
                <p style="margin:2px 0 0;">W: <a href="https://www.winningadventure.com.au" style="color:#0F2D5E;">www.winningadventure.com.au</a></p>
                <p style="margin:8px 0 0;"><img src="https://ci3.googleusercontent.com/mail-sig/AIorK4yl18HxgQm-cX3JfvZ5zWLINXcxJIIWZ76wqsD8g0LPM4PD8ZSA7wklu2F26FdeF8pJ_WqDrVO-xKDL" width="200" height="40" alt="Winning Adventure Global" style="display:block;" /></p>
              </div>
            </div>
            <p style="font-size:11px;color:#9ca3af;text-align:center;padding:16px;">Winning Adventure Global · 5/54 Melbourne St, North Adelaide SA 5006</p>
          </div>
        `,
      })
    } catch (autoReplyError) {
      console.error('Auto-reply email error:', autoReplyError instanceof Error ? autoReplyError.message : autoReplyError)
    }

    const response = NextResponse.json({ ok: true, enquiryId })
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
