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
      className="relative bg-[#060d17] border-t border-white/10 px-6 py-12 lg:px-8"
      role="contentinfo"
    >
      <div className="footer-inner mx-auto max-w-[1280px] flex flex-col items-center">
        <Link
          href="/"
          className="transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#7D9AB3] rounded-sm"
        >
          <span 
            className="text-2xl font-normal text-white"
            style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
          >
            Talkio
          </span>
        </Link>
        <p className="mt-3 text-sm text-white/80">
          © 2026 <span 
            className="text-sm font-normal text-white/80"
            style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
          >
            Talkio
          </span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
