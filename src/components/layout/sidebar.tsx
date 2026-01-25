'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { OrganizationSwitcher } from '@clerk/nextjs'
import {
  BookOpen,
  Settings,
  Users,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useModal } from '@/contexts/modal-context'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Sales Training', href: '/training', icon: GraduationCap },
  { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
  { name: 'Docs', href: '/product', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { isModalOpen } = useModal()

  return (
    <aside
      className={cn(
        'relative z-20 flex flex-col border-r border-[#E0E7FF] bg-[#F6F5FA] transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
        isModalOpen && 'opacity-40 blur-xl pointer-events-none border-transparent shadow-none brightness-[0.3]'
      )}
    >
      {/* Logo & Org Switcher */}
      <div className={cn(
        "flex h-16 items-center justify-between border-b border-[#E0E7FF] px-4 bg-white transition-all duration-300",
        isModalOpen && "border-transparent shadow-none"
      )}>
        {!collapsed ? (
          <>
            <Link href="/dashboard" className="flex items-center transition-all duration-500 ease-in-out">
              <div className="transition-opacity duration-500 ease-in-out opacity-100">
                <Image
                  src="/talkio-logo.svg"
                  alt="Talkio"
                  width={120}
                  height={36}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="h-7 w-7 rounded-md flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center transition-all duration-500 ease-in-out hover:opacity-80"
            aria-label="Expand sidebar"
          >
            <div className="relative w-8 h-8 transition-opacity duration-500 ease-in-out opacity-100 cursor-pointer">
              <div className="h-full w-full rounded-lg bg-black flex items-center justify-center">
                <span className="text-white font-bold text-sm italic" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>T</span>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Organization Switcher */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        collapsed ? "max-h-0 opacity-0" : "max-h-32 opacity-100"
      )}>
        <div className={cn(
          "p-3 border-b border-[#E0E7FF] bg-white transition-all duration-300",
          isModalOpen && "border-transparent shadow-none"
        )}>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: 'w-full',
                organizationSwitcherTrigger: 'w-full justify-between bg-[#F5F7FA] border border-[#E0E7FF] text-black hover:bg-gray-50 rounded-lg text-[11px] px-2.5 py-2 font-medium',
                organizationSwitcherTriggerIcon: 'text-black',
                organizationPreviewTextContainer: 'text-black font-medium',
                organizationPreviewSecondaryIdentifier: 'text-gray-600 font-medium',
              },
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 px-2 overflow-y-auto transition-all duration-500 ease-in-out",
        collapsed ? "py-3 space-y-4" : "py-3 space-y-3"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg transition-all duration-500 ease-in-out',
                collapsed 
                  ? 'justify-center px-0 py-3 gap-0' 
                  : 'gap-3 px-3 py-2.5',
                isActive
                  ? cn('bg-white text-black font-semibold', !isModalOpen && 'shadow-sm')
                  : 'text-black font-medium hover:bg-white/80',
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn(
                "flex-shrink-0 transition-all duration-500 ease-in-out",
                collapsed ? "h-5 w-5" : "h-5 w-5"
              )} />
              {!collapsed && (
                <span className="text-base transition-opacity duration-500 ease-in-out opacity-100">
                  {item.name}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        collapsed ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
      )}>
        <div className={cn(
          "px-4 py-3 border-t border-[#E0E7FF] transition-all duration-300",
          isModalOpen && "border-transparent"
        )}>
          <p className="text-[10px] text-gray-400 font-medium">
            v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}
