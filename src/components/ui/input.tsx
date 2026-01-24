import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-medium text-[#4338CA] leading-none"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-9 w-full rounded-lg border border-[#E0E7FF] bg-white px-3 py-2 text-[13px] text-[#1E1B4B] placeholder:text-[#A5B4FC] focus:outline-none focus:border-[#4F46E5] focus:ring-2 focus:ring-[#EEF2FF] disabled:cursor-not-allowed disabled:opacity-40 transition-all',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#FEE2E2]',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-[10px] text-[#EF4444]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
