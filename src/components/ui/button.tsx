'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer'
    
    const variants = {
      default: 'bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm',
      secondary: 'bg-[#EEF2FF] text-[#1E1B4B] hover:bg-[#E0E7FF]',
      outline: 'border border-[#E0E7FF] bg-white text-[#4338CA] hover:bg-[#F5F7FA] hover:text-[#4F46E5]',
      ghost: 'text-[#4338CA] hover:bg-[#EEF2FF] hover:text-[#4F46E5]',
      destructive: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm',
    }
    
    const sizes = {
      sm: 'h-7 px-2.5 text-[11px] rounded-lg',
      md: 'h-8 px-3 text-[12px] rounded-lg',
      lg: 'h-9 px-4 text-[12px] rounded-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-1.5 h-3.5 w-3.5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
