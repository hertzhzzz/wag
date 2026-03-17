'use client'

import { useEffect } from 'react'

export default function Error({
  error,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 忽略浏览器扩展导致的错误
    if (error.message?.includes('postMessage') ||
        error.message?.includes('content_script')) {
      console.warn('Browser extension error ignored:', error.message)
      return
    }
    // 其他错误正常记录
    console.error(error)
  }, [error])

  return null
}
