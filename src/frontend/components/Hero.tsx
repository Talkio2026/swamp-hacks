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
              Post-call AI analysis that generates summaries, tracks context, and surfaces next actions—automatically.
            </p>

            <div className="hero-ctas mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Sign in to search
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Access API
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Preview/Demo */}
          <div className="hero-preview">
            <div className="relative rounded-2xl border border-purple-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
              {/* Search Bar */}
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-slate-200 bg-purple-50/30 px-4 py-3">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  readOnly
                  value="former tesla autopilot engineers..."
                  className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
                />
              </div>

              {/* Results Preview */}
              <div className="space-y-3">
                {[
                  { name: 'Dr. Emily Zhang', role: 'VP of Engineering', company: 'Wayve', matches: 3 },
                  { name: 'Alex Petrov', role: 'Lead Machine Learning', company: 'Aurora', matches: 3 },
                  { name: 'Dr. Priya Sharma', role: 'Co-Founder & CTO', company: 'MotionPilot', matches: 3 },
                ].map((person, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-slate-200/60 bg-white/60 p-3 transition-colors hover:border-purple-300/60"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-sm font-medium text-purple-900">
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm">{person.name}</div>
                      <div className="text-xs text-slate-500">
                        {person.role} • {person.company}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(person.matches)].map((_, j) => (
                        <div key={j} className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom badge */}
              <div className="mt-6 flex items-center justify-between rounded-lg border border-purple-200/60 bg-purple-50/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">Max Compute</span>
                  </div>
                  <div className="h-3 w-px bg-slate-300" />
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-xs font-medium text-slate-700">High Reasoning</span>
                  </div>
                </div>
                <button className="text-xs font-medium text-slate-600 hover:text-slate-900">
                  Try Atlas →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
