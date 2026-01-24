import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background text-foreground',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
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
    <Badge variant={variants[role]} className="text-[10px]">
      {role}
    </Badge>
  )
}
