'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-block', {
        scrollTrigger: {
          trigger: '.cta-block',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        y: 28,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta"
      className="relative bg-[#f8fafc] px-6 py-20 lg:px-8 lg:py-28"
      aria-labelledby="cta-heading"
    >
      {/* Frosted glass top transition */}
      <div className="absolute top-0 left-0 right-0 h-32 backdrop-blur-2xl bg-gradient-to-b from-[#1e3a5f]/80 to-transparent" aria-hidden />
      
      <div className="cta-block mx-auto max-w-[1280px] text-center relative z-10">
        <h2
          id="cta-heading"
          className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl"
        >
          Turn call recordings into structured intelligence
        </h2>
        <p className="mt-4 text-base text-slate-600">
          Start analyzing sales calls with AI-powered post-call summaries and next-action tracking.
        </p>
        <div className="mt-10">
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center rounded-full bg-[#1e3a5f] px-8 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#2c4a6a] hover:shadow-lg hover:shadow-[#1e3a5f]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
