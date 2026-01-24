'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Product', href: '#features' },
  { label: 'Pricing', href: '#cta' },
  { label: 'About', href: '#footer' },
] as const;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1) Initial page load: fade in, y -10 → 0, 0.4s, power2.out
      gsap.from(el, {
        opacity: 0,
        y: -10,
        duration: 0.4,
        ease: 'power2.out',
      });

      // 2) On scroll: subtle box-shadow when scrolled > 40px, smooth scrub
      gsap.fromTo(
        el,
        { boxShadow: '0 0 0 rgba(0, 0, 0, 0)' },
        {
          boxShadow:
            '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
          ease: 'none',
          scrollTrigger: {
            trigger: document.body,
            start: '0 0',
            end: '40 0',
            scrub: true,
          },
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="navbar sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <nav
        className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-6 py-4 md:grid md:grid-cols-[1fr_auto_1fr] md:justify-between lg:px-8"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="text-xl font-semibold text-slate-900 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm"
        >
          Talkio
        </Link>

        {/* Desktop nav - centered */}
        <div className="hidden md:flex md:items-center md:justify-center md:gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 rounded-sm"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:justify-end">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
          >
            Request Demo
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 md:hidden"
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
      <div
        id="mobile-nav"
        role="region"
        aria-label="Mobile menu"
        className={cn(
          'border-t border-slate-200 bg-white md:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <div className="mx-auto max-w-[1200px] flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-slate-600 hover:bg-violet-50 hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-up"
            onClick={() => setMobileOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
