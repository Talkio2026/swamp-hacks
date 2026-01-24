'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-heading', {
        y: 28,
        opacity: 0,
        duration: 0.65,
      })
        .from(
          '.hero-subhead',
          { y: 20, opacity: 0, duration: 0.5 },
          '-=0.35'
        )
        .from(
          '.hero-ctas',
          { y: 20, opacity: 0, duration: 0.45 },
          '-=0.3'
        )
        .from(
          '.hero-preview',
          { x: 40, opacity: 0, duration: 0.6 },
          '-=0.5'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-20 lg:px-8 lg:py-32"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <div className="max-w-2xl">
            <h1
              id="hero-heading"
              className="hero-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.1]"
            >
              Turn every sales call into structured intelligence.
            </h1>
            <p className="hero-subhead mt-6 text-base text-slate-600 sm:text-lg">
              Post-call AI analysis that generates summaries, tracks context, and surfaces next actions—automatically. No real-time overhead, just results.
            </p>

            <div className="hero-ctas mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 rounded-full px-6 py-3"
              >
                See How It Works
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: City Skyline Image */}
          <div className="hero-preview">
            <div className="relative rounded-3xl overflow-hidden border border-purple-200/60 shadow-2xl">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/skyline-hero.jpg"
                  alt="City skyline at dusk"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Overlay gradient for better text visibility if needed */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
