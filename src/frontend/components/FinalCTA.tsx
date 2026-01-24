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
      className="bg-gradient-to-br from-purple-50/40 to-white px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="cta-heading"
    >
      <div className="cta-block mx-auto max-w-[1280px] text-center">
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
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
