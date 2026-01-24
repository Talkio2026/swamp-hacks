'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

const ROTATING_PHRASES = [
  'structured intelligence.',
  'Decision-ready insights.',
  'Contextual analysis.',
];

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const rotatingTextRef = useRef<HTMLSpanElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Rotating text animation
  useEffect(() => {
    const interval = setInterval(() => {
      if (rotatingTextRef.current) {
        // Animate out (slide up and fade)
        gsap.to(rotatingTextRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.in',
          onComplete: () => {
            setCurrentIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
            // Reset position below and animate in
            gsap.set(rotatingTextRef.current, { y: 20 });
            gsap.to(rotatingTextRef.current, {
              y: 0,
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
            });
          },
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // #region agent log
    console.log('[DEBUG Frontend Hero.tsx:10] Hero mounted', { sectionExists: !!sectionRef.current });
    fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/Hero.tsx:10',message:'Hero mounted',data:{sectionExists:!!sectionRef.current},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

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

    // #region agent log
    if (sectionRef.current) {
      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const styles = window.getComputedStyle(section);
      const navbar = document.querySelector('header.navbar');
      const navbarRect = navbar ? navbar.getBoundingClientRect() : null;
      const gapBetween = navbarRect ? rect.top - navbarRect.bottom : null;
      const debugData = {
        heroTop: rect.top,
        heroHeight: rect.height,
        heroPaddingTop: styles.paddingTop,
        heroMarginTop: styles.marginTop,
        heroBg: styles.backgroundImage,
        navbarTop: navbarRect?.top,
        navbarBottom: navbarRect?.bottom,
        navbarHeight: navbarRect?.height,
        gapBetween
      };
      console.log('[DEBUG Frontend Hero.tsx:40] Gap analysis', debugData);
      fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/Hero.tsx:40',message:'Hero dimensions',data:debugData,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1,H2,H5'})}).catch(()=>{});
    }
    // #endregion

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 flex flex-col justify-center h-full px-6 pt-24 pb-12 lg:px-8 lg:pt-32 lg:pb-16">
        <div className="mx-auto max-w-[1280px] w-full">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center -mt-16 lg:-mt-24">
          {/* Left: Text Content — light, inverted against photo */}
          <div className="max-w-2xl">
            <h1
              id="hero-heading"
              className="hero-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]"
            >
              <span className="whitespace-nowrap">Turn every sales call into</span>
              <br />
              <span 
                className="inline-block overflow-hidden align-bottom h-[1.2em]"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
              >
                <span
                  ref={rotatingTextRef}
                  className="inline-block"
                >
                  {ROTATING_PHRASES[currentIndex]}
                </span>
              </span>
            </h1>
            <p className="hero-subhead mt-6 text-base text-slate-200 sm:text-lg font-[family-name:var(--font-inter)] font-light">
              Post-call AI analysis that generates summaries, tracks context, and surfaces next actions—automatically.
            </p>

            <div className="hero-ctas mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                Sign in to search
              </Link>
            </div>
          </div>

          {/* Right: Preview — dark glass, light text */}
          <div className="hero-preview w-full max-w-md ml-auto">
            <div className="relative rounded-xl border border-white/20 bg-black/40 p-4 shadow-xl backdrop-blur-md">
              {/* Search Bar */}
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  readOnly
                  value="former tesla autopilot engineers..."
                  className="flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500"
                />
              </div>

              {/* Results Preview */}
              <div className="space-y-2">
                {[
                  { name: 'Dr. Emily Zhang', role: 'VP of Engineering', company: 'Wayve', matches: 3 },
                  { name: 'Alex Petrov', role: 'Lead Machine Learning', company: 'Aurora', matches: 3 },
                  { name: 'Dr. Priya Sharma', role: 'Co-Founder & CTO', company: 'MotionPilot', matches: 3 },
                ].map((person, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 p-2 transition-colors hover:border-white/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                      {person.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-xs">{person.name}</div>
                      <div className="text-[10px] text-slate-400">
                        {person.role} • {person.company}
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(person.matches)].map((_, j) => (
                        <div key={j} className="h-1 w-1 rounded-full bg-emerald-400" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom badge */}
              <div className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[10px] font-medium text-slate-300">Max Compute</span>
                  </div>
                  <div className="h-2.5 w-px bg-white/20" />
                  <div className="flex items-center gap-1">
                    <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-[10px] font-medium text-slate-300">High Reasoning</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">Try Atlas →</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
