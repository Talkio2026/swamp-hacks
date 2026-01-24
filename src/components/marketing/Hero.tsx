'use client';

import Link from 'next/link';
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
          '.hero-preview',
          { y: 36, opacity: 0, duration: 0.6 },
          '-=0.25'
        )
        .from(
          '.hero-ctas a',
          { y: 20, opacity: 0, duration: 0.45, stagger: 0.1 },
          '-=0.3'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#faf8ff] px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="hero-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          >
            Know which sales calls need attention—before they become lost deals
          </h1>
          <p className="hero-subhead mt-4 text-lg text-slate-600 sm:text-xl">
            Post-call intelligence that flags risk, surfaces objections, and keeps deals moving.
          </p>
        </div>

        <div className="hero-preview mx-auto mt-12 max-w-4xl">
          <div
            className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-violet-100 bg-violet-50/50 px-6 py-12 sm:min-h-[320px]"
            role="img"
            aria-label="Dashboard preview"
          >
            <p className="text-center text-sm text-slate-500 sm:text-base">
              Dashboard preview placeholder — KPIs, call risk, and next steps
            </p>
          </div>
        </div>

        <div className="hero-ctas mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="#features"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-violet-500 bg-transparent px-6 py-3 text-base font-medium text-slate-900 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
            See it in action
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:w-auto"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
