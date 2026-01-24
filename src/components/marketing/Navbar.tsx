'use client';

import Link from 'next/link';
import Image from 'next/image';
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
        className="mx-auto max-w-[1280px] rounded-2xl bg-white/40 border border-purple-200/30 shadow-sm backdrop-blur-xl px-6 py-4 flex items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="relative h-10 w-[120px] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-sm"
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
        <div className="hidden md:flex md:items-center md:justify-center md:gap-8 flex-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 rounded-sm"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:justify-end">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Dashboard
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-purple-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 md:hidden"
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
          'mt-2 mx-auto max-w-[1280px] rounded-2xl bg-white/70 border border-purple-200/30 shadow-lg backdrop-blur-xl p-4 md:hidden',
          mobileOpen ? 'block' : 'hidden'
        )}
      >
        <div className="flex flex-col gap-1">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-slate-600 hover:bg-purple-50 hover:text-slate-900"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/sign-up"
            onClick={() => setMobileOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
}
