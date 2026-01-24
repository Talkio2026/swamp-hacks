'use client'

import { UserButton } from '@clerk/nextjs'
import { RoleBadge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: React.ReactNode
  description?: string
  role?: 'ADMIN' | 'MANAGER' | 'REP'
  actions?: React.ReactNode
}

export function Header({ title, description, role, actions }: HeaderProps) {
  return (
    <header className="mx-4 mt-4 mb-0 h-14 rounded-2xl border border-border/60 bg-card shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            {role && <RoleBadge role={role} />}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full p-0"
        >
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-9 w-9 rounded-full',
            },
          }}
        />
      </div>
    </header>
  )
}
