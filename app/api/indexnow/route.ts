import { NextRequest, NextResponse } from 'next/server'

/**
 * IndexNow Protocol API Endpoint
 *
 * Submits URLs to Bing, Yandex, and Naver for fast indexing.
 * Google does NOT support IndexNow — use GSC URL Inspection for Google.
 *
 * IndexNow API Docs: https://www.indexnow.org/
 */

const INDEXNOW_ENDPOINTS = {
  bing: 'https://www.bing.com/indexnow',
  yandex: 'https://yandex.com/indexnow',
  naver: 'https://searchad.naver.com/indexnow',
}

// API key must be hosted at: /api/indexnow?key=<key>
// For production, set this in Vercel environment variables
const INDEXNOW_API_KEY_2 = process.env.INDEXNOW_API_KEY_2 || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(url)
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { error: 'Invalid URL protocol' },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Build IndexNow payload
    const payload = {
      host: 'www.winningadventure.com.au',
      key: INDEXNOW_API_KEY_2,
      keyLocation: INDEXNOW_API_KEY_2
        ? `https://www.winningadventure.com.au/api/indexnow?key=${INDEXNOW_API_KEY_2}`
        : undefined,
      urlList: Array.isArray(url) ? url : [url],
    }

    // Submit to Bing IndexNow (primary for Australian market)
    const results: Record<string, { success: boolean; status: number; error?: string }> = {}

    try {
      const bingResponse = await fetch(INDEXNOW_ENDPOINTS.bing, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      results.bing = {
        success: bingResponse.ok,
        status: bingResponse.status,
        error: bingResponse.ok ? undefined : await bingResponse.text(),
      }
    } catch (bingError) {
      results.bing = {
        success: false,
        status: 0,
        error: bingError instanceof Error ? bingError.message : 'Network error',
      }
    }

    // Log submission for debugging
    console.log('[IndexNow] Submission:', {
      url,
      timestamp: new Date().toISOString(),
      results,
    })

    return NextResponse.json({
      success: results.bing?.success ?? false,
      submitted: Array.isArray(url) ? url : [url],
      results,
      message: 'IndexNow submission complete. Note: Google does NOT support IndexNow.',
    })

  } catch (error) {
    console.error('[IndexNow] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for key verification (required by IndexNow spec)
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')

  if (!key || key !== INDEXNOW_API_KEY_2) {
    return NextResponse.json(
      { error: 'Invalid or missing API key' },
      { status: 401 }
    )
  }

  // Return the key for verification
  return new NextResponse(INDEXNOW_API_KEY_2, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  })
}
