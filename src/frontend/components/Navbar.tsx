'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Product', href: '/product', hasDropdown: false },
  { label: 'Dashboard', href: '/dashboard', hasDropdown: false },
  { label: 'Contact Us', href: 'mailto:contact@talkio.com', hasDropdown: false },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    // #region agent log
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    const debugData = {
      top:rect.top,
      bottom:rect.bottom,
      height:rect.height,
      marginTop:styles.marginTop,
      marginBottom:styles.marginBottom,
      topStyle:styles.top,
      position:styles.position
    };
    console.log('[DEBUG Navbar.tsx:24] Navbar position', debugData);
    fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Navbar.tsx:24',message:'Navbar dimensions',data:debugData,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H4'})}).catch(()=>{});
    // #endregion

    const ctx = gsap.context(() => {
      // Initial page load: fade in, y -10 → 0
      gsap.from(el, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        ease: 'power2.out',
      });
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="navbar fixed top-4 left-0 right-0 z-[100] w-full px-4 lg:px-8"
    >
      <nav
        className="mx-auto max-w-[1280px] rounded-full bg-white/10 border border-white/20 shadow-lg shadow-black/10 backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl"
        >
          <span 
            className="text-2xl font-normal text-white"
            style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
          >
            Talkio
          </span>
        </Link>

        {/* Desktop nav - centered */}
        <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
          {NAV_LINKS.map(({ label, href, hasDropdown }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl"
            >
              {label}
              {hasDropdown && (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <span className="sr-only">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
          {mobileOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          role="region"
          aria-label="Mobile menu"
          className="lg:hidden mt-2 mx-auto max-w-[1280px] rounded-[32px] bg-black/40 border border-white/20 shadow-xl shadow-black/20 backdrop-blur-xl p-6"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, hasDropdown }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <span>{label}</span>
                {hasDropdown && (
                  <ChevronDown className="w-4 h-4 text-white/60" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
