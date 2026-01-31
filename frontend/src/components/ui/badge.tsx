import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#EEF2FF] text-[#4F46E5]',
    secondary: 'bg-[#F5F7FA] text-[#4338CA]',
    outline: 'border border-[#E0E7FF] bg-white text-[#4338CA]',
    success: 'bg-[#D1FAE5] text-[#10B981]',
    warning: 'bg-[#FEF3C7] text-[#F59E0B]',
    destructive: 'bg-[#FEE2E2] text-[#EF4444]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

// Risk level badge with specific colors
export function RiskBadge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' | null }) {
  if (!level) return null
  
  const variants = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'destructive',
  } as const
  
  const labels = {
    LOW: 'Low Risk',
    MEDIUM: 'Medium Risk',
    HIGH: 'High Risk',
  }
  
  return (
    <Badge variant={variants[level]}>
      {labels[level]}
    </Badge>
  )
}

// Status badge for call processing
export function StatusBadge({ status }: { status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }) {
  const variants = {
    PENDING: 'secondary',
    PROCESSING: 'warning',
    COMPLETED: 'success',
    FAILED: 'destructive',
  } as const
  
  const labels = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  }
  
  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

// Role badge
export function RoleBadge({ role }: { role: 'ADMIN' | 'MANAGER' | 'REP' }) {
  const variants = {
    ADMIN: 'default',
    MANAGER: 'secondary',
    REP: 'outline',
  } as const
  
  return (
    <Badge variant={variants[role]} className="text-[9px]">
      {role}
    </Badge>
  )
}
