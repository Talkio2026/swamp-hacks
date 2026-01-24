'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      className="border-t border-white/10 px-6 py-12 lg:px-8"
      role="contentinfo"
    >
      <div className="footer-inner mx-auto max-w-[1280px] flex flex-col items-center">
        <Link
          href="/"
          className="relative h-10 w-[120px] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
        >
          <Image
            src="/talkio-logo-white.svg"
            alt="Talkio"
            fill
            className="object-contain"
          />
        </Link>
        <p className="mt-3 text-sm text-slate-500">
          © 2026 Talkio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
