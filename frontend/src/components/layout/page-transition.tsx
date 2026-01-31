'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [displayChildren, setDisplayChildren] = useState(children)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    // Only trigger transition if pathname actually changed
    if (prevPathnameRef.current !== pathname) {
      setIsTransitioning(true)
      
      // Scroll to top on page change (for the main container)
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.scrollTo({ top: 0, behavior: 'smooth' })
      }
      
      const timer = setTimeout(() => {
        setDisplayChildren(children)
        setIsTransitioning(false)
        prevPathnameRef.current = pathname
      }, 200)

      return () => clearTimeout(timer)
    } else {
      // Update children without transition if pathname hasn't changed
      setDisplayChildren(children)
    }
  }, [pathname, children])

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isTransitioning
          ? 'opacity-0 translate-y-3'
          : 'opacity-100 translate-y-0'
      }`}
      style={{
        transitionProperty: 'opacity, transform',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {displayChildren}
    </div>
  )
}
