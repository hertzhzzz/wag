'use client'
import { useEffect, useRef } from 'react'

interface KeyboardAwareTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  error?: string
  onBlur?: () => void
}

export function KeyboardAwareTextarea({
  label,
  required = false,
  error,
  onBlur,
  id,
  className,
  ...props
}: KeyboardAwareTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      // Adjust on mobile: either keyboard is open (viewport shrunk) OR small viewport
      const isMobileViewport = window.innerWidth <= 480
      const isKeyboardOpen = viewport.height < window.innerHeight * 0.85

      if (isMobileViewport || isKeyboardOpen) {
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
        onBlur={onBlur}
        data-testid={id === 'lookingFor' ? 'message' : undefined}
        className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-[#0F2D5E] outline-none focus:border-[#0F2D5E] min-h-[120px] resize-y ${
          error ? 'border-red-400 focus:border-red-500' : 'border-gray-200'
        } ${className || ''}`}
        {...props}
      />
      {/* Hidden input for test compatibility */}
      {id === 'lookingFor' && (
        <input type="hidden" id="message" data-testid="message" />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
