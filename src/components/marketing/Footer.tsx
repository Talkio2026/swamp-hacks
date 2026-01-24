'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.footer-inner', {
        scrollTrigger: {
          trigger: '.footer-inner',
          start: 'top 92%',
          toggleActions: 'play none none reverse',
        },
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      className="bg-indigo-950 px-6 py-12 lg:px-8"
      role="contentinfo"
    >
      <div className="footer-inner mx-auto max-w-[1200px] text-center">
        <Link
          href="/"
          className="text-xl font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 rounded-sm"
        >
          Talkio
        </Link>
        <p className="mt-3 text-sm text-white/70">
          © 2026 Talkio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
