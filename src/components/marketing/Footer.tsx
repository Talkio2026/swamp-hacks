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
      className="relative bg-[#1e3a5f] px-6 py-12 lg:px-8"
      role="contentinfo"
    >
      {/* Frosted glass top transition */}
      <div className="absolute top-0 left-0 right-0 h-32 backdrop-blur-2xl bg-gradient-to-b from-[#f8fafc]/80 to-transparent" aria-hidden />
      
      <div className="footer-inner mx-auto max-w-[1280px] flex flex-col items-center relative z-10">
        <Link
          href="/"
          className="relative h-10 w-[120px] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e3a5f] rounded-sm"
        >
          <Image
            src="/talkio-logo-white.svg"
            alt="Talkio"
            fill
            className="object-contain"
          />
        </Link>
        <p className="mt-3 text-sm text-white/70">
          © 2026 Talkio. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
