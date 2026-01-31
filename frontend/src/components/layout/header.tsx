'use client'

import { UserButton } from '@clerk/nextjs'
import { RoleBadge } from '@/components/ui/badge'
import { useModal } from '@/contexts/modal-context'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: React.ReactNode
  description?: string
  role?: 'ADMIN' | 'MANAGER' | 'REP'
  actions?: React.ReactNode
  className?: string
  titleSize?: 'default' | 'large'
}

export function Header({ title, description, role, actions, className, titleSize = 'default' }: HeaderProps) {
  const { isModalOpen } = useModal()
  
  return (
    <header className={cn(
      "relative z-[1] h-16 border-b border-[#E0E7FF] bg-white flex items-center justify-between px-8 transition-all duration-300 ease-in-out",
      isModalOpen && "opacity-60",
      className
    )}>
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className={cn(
              "font-bold text-[#1E1B4B] tracking-tight",
              titleSize === 'large' ? "text-3xl" : "text-2xl"
            )}>{title}</h1>
            {role && <RoleBadge role={role} />}
          </div>
          {description && (
            <p className="text-base text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {actions}

        <div className="w-px h-6 bg-[#E0E7FF] mx-1 transition-all duration-300" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-11 w-11 rounded-lg',
            },
          }}
        />
      </div>
    </header>
  )
}
