'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Product', href: '#features', hasDropdown: true },
  { label: 'Individuals', href: '#features', hasDropdown: true },
  { label: 'Business', href: '#features', hasDropdown: false },
  { label: 'Pricing', href: '#cta', hasDropdown: false },
  { label: 'About', href: '#footer', hasDropdown: true },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

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
      className="navbar sticky top-4 z-50 w-full px-4 lg:px-8"
    >
      <nav
        className="mx-auto max-w-[1280px] rounded-full bg-white/40 border border-purple-200/30 shadow-sm backdrop-blur-xl px-8 py-4 flex items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="relative h-10 w-[120px] flex-shrink-0 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
        >
          <Image
            src="/talkio-logo.svg"
            alt="Talkio"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>

        {/* Desktop nav - centered */}
        <div className="hidden lg:flex items-center justify-center gap-8 flex-1">
          {NAV_LINKS.map(({ label, href, hasDropdown }) => (
            <Link
              key={label}
              href={href}
              className="inline-flex items-center gap-1 text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-xl"
            >
              {label}
              {hasDropdown && (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Dashboard
              </Link>
            </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-600 hover:bg-[#FCE5FC] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E7C6FF] lg:hidden"
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
          className="lg:hidden mt-2 mx-auto max-w-[1280px] rounded-[32px] bg-white/70 border border-purple-200/30 shadow-lg backdrop-blur-xl p-6"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href, hasDropdown }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-slate-600 hover:bg-purple-50 hover:text-slate-900"
              >
                <span>{label}</span>
                {hasDropdown && (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </Link>
            ))}
            <div className="mt-3 pt-3 border-t border-purple-200/40 flex flex-col gap-2">
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
