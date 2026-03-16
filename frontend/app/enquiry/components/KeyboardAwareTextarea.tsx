'use client'
import { useEffect, useRef } from 'react'

interface KeyboardAwareTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  error?: string
}

export function KeyboardAwareTextarea({
  label,
  required = false,
  error,
  id,
  className,
  ...props
}: KeyboardAwareTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      if (viewport.height < window.innerHeight * 0.85) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }
    }

    const textarea = textareaRef.current
    textarea?.addEventListener('focus', handleFocus)
    return () => textarea?.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
      >
        {label} {required && <span className="text-[#F59E0B]">*</span>}
      </label>
      <textarea
        ref={textareaRef}
        id={id}
        className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E] min-h-[120px] resize-y ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200'
        } ${className || ''}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
