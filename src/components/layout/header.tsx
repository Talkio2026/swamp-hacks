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
    <header className="h-16 border-b border-[#E0E7FF] bg-white flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[18px] font-bold text-black">{title}</h1>
            {role && <RoleBadge role={role} />}
          </div>
          {description && (
            <p className="text-[15px] text-gray-600 mt-1 font-medium">{description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {actions}

        <button className="relative h-10 w-10 rounded-lg flex items-center justify-center text-black hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-black" />
        </button>

        <div className="w-px h-6 bg-[#E0E7FF] mx-1" />

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
