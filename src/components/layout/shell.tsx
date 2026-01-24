'use client'

import { Sidebar } from './sidebar'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
