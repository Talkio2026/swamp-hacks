'use client'

import { UserButton } from '@clerk/nextjs'
import { RoleBadge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

interface HeaderProps {
  title: React.ReactNode
  description?: string
  role?: 'ADMIN' | 'MANAGER' | 'REP'
  actions?: React.ReactNode
}

export function Header({ title, description, role, actions }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[#E0E7FF] bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[14px] font-bold text-black">{title}</h1>
            {role && <RoleBadge role={role} />}
          </div>
          {description && (
            <p className="text-[11px] text-gray-600 mt-1 font-medium">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions}

        <button className="relative h-8 w-8 rounded-lg flex items-center justify-center text-black hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-black" />
        </button>

        <div className="w-px h-5 bg-[#E0E7FF] mx-1" />

        <UserButton
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8 rounded-lg',
            },
          }}
        />
      </div>
    </header>
  )
}
