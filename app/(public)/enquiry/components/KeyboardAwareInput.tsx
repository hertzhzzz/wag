'use client'
import { useEffect, useRef } from 'react'

interface KeyboardAwareInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  onBlur?: () => void
}

export function KeyboardAwareInput({
  label,
  required = false,
  optional = false,
  error,
  onBlur,
  id,
  className,
  ...props
}: KeyboardAwareInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleFocus = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      // Adjust on mobile: either keyboard is open (viewport shrunk) OR small viewport
      const isMobileViewport = window.innerWidth <= 480
      const isKeyboardOpen = viewport.height < window.innerHeight * 0.85

      if (isMobileViewport || isKeyboardOpen) {
        setTimeout(() => {
          inputRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        }, 100)
      }
    }

    const input = inputRef.current
    input?.addEventListener('focus', handleFocus)
    return () => input?.removeEventListener('focus', handleFocus)
  }, [])

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5"
      >
        {label} {required && <span className="text-amber">*</span>}{!required && optional && <span className="text-gray-500 font-normal normal-case tracking-wide lowercase ml-1">(optional)</span>}
      </label>
      <input
        ref={inputRef}
        id={id}
        onBlur={onBlur}
        className={`w-full py-3 px-4 border rounded text-[0.9375rem] text-navy outline-none transition-colors ${
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-navy focus:ring-2 focus:ring-amber/40'
        } ${className || ''}`}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
