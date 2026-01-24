'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // #region agent log
    console.log('[DEBUG Hero.tsx:11] Hero mounted', {sectionExists:!!sectionRef.current});
    fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Hero.tsx:11',message:'Hero mounted',data:{sectionExists:!!sectionRef.current},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
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
      const navbarStyles = navbar ? window.getComputedStyle(navbar) : null;
      const gapBetween = navbarRect ? rect.top - navbarRect.bottom : null;
      const debugData = {
        heroTop:rect.top,
        heroHeight:rect.height,
        heroPaddingTop:styles.paddingTop,
        heroMarginTop:styles.marginTop,
        navbarTop:navbarRect?.top,
        navbarBottom:navbarRect?.bottom,
        navbarHeight:navbarRect?.height,
        navbarTopStyle:navbarStyles?.top,
        gapBetween:gapBetween
      };
      console.log('[DEBUG Hero.tsx:35] Gap analysis', debugData);
      fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Hero.tsx:35',message:'Hero section dimensions',data:debugData,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2,H5'})}).catch(()=>{});
    }
    // #endregion

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden flex items-center"
      aria-labelledby="hero-heading"
    >
      {/* Smooth gradient transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#2c4a6a]/30 to-[#2c4a6a]/60 blur-2xl z-20" />
      
      <div className="mx-auto max-w-[1280px] relative z-10 px-6 lg:px-8 py-20 w-full">
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
                className="inline-flex items-center justify-center rounded-full bg-[#1e3a5f] px-8 py-3 text-sm font-medium text-white transition-all hover:bg-[#2c4a6a] hover:shadow-lg hover:shadow-[#1e3a5f]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a5f] focus-visible:ring-offset-2"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 transition-colors hover:text-[#1e3a5f] rounded-full px-6 py-3 hover:bg-white/60"
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
            <div className="relative rounded-3xl overflow-hidden border border-[#2c4a6a]/30 shadow-2xl shadow-[#1e3a5f]/20 w-full">
              <div className="relative w-full aspect-[4/3] min-h-[400px] lg:min-h-[500px]">
                <Image
                  src="/skyline-hero.jpg"
                  alt="City skyline at dusk"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
