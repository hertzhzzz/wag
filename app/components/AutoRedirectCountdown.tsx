'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const REDIRECT_SECONDS = 5
const REDIRECT_TARGET = '/'

// Visible countdown that sends the user home after REDIRECT_SECONDS.
// Existing page buttons/links are untouched and remain clickable the
// whole time — this only fires if the user hasn't already navigated away.
export default function AutoRedirectCountdown() {
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      router.push(REDIRECT_TARGET)
      return
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft, router])

  return (
    <p className="text-blue-200 text-sm mt-6">
      Redirecting to home in {secondsLeft}s...
    </p>
  )
}
