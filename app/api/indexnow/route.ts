import { NextRequest, NextResponse } from 'next/server'

/**
 * IndexNow Protocol API Endpoint
 *
 * Submits URLs to Bing for fast indexing.
 * Google does NOT support IndexNow — use GSC URL Inspection for Google.
 */

const INDEXNOW_BING = 'https://www.bing.com/indexnow'
const SITE_KEY = 'qXFgF78NEr0TmLkL6E2zK2gqmc088qwK'
const KEY_LOCATION = `https://www.winningadventure.com.au/${SITE_KEY}.txt`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const urlList = Array.isArray(url) ? url : [url]

    const payload = {
      host: 'www.winningadventure.com.au',
      key: SITE_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }

    const response = await fetch(INDEXNOW_BING, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    return NextResponse.json({
      success: response.ok,
      submitted: urlList,
      bingStatus: response.status,
      message: response.ok 
        ? 'URL submitted to Bing IndexNow' 
        : 'Bing rejected the submission',
    })

  } catch (error) {
    console.error('[IndexNow]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET() {
  return new NextResponse(SITE_KEY, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
