'use client'

import { Sidebar } from './sidebar'
import { PageTransition } from './page-transition'

interface ShellProps {
  children: React.ReactNode
}

export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F6F5FA]">
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-auto bg-[#F6F5FA]">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
