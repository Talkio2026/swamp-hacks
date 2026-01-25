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
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-80 items-center -mt-16 lg:-mt-24">
          {/* Left: Text Content — light, inverted against photo */}
          <div className="max-w-2xl">
            <h1
              id="hero-heading"
              className="hero-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.15]"
            >
              <span className="whitespace-nowrap">Turn every sales call into</span>
              <br />
              <span 
                className="inline-block overflow-hidden align-bottom h-[1.4em]"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                }}
              >
                <span
                  ref={rotatingTextRef}
                  className="inline-block whitespace-nowrap leading-[1.15] py-[0.05em]"
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

          {/* Right: Mac-style Video Frame */}
          <div className="hero-preview w-full max-w-2xl ml-auto mr-8 lg:mr-16 xl:mr-32">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white" style={{
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.4), 0 0 80px rgba(59, 130, 246, 0.2), 0 20px 40px rgba(0, 0, 0, 0.1)'
            }}>
              {/* Mac-style Title Bar with white background */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
                {/* Traffic Lights with hover effects */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner hover:bg-[#ff6f67] transition-colors cursor-pointer group relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Close</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-inner hover:bg-[#ffcd3e] transition-colors cursor-pointer group relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Minimize</span>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner hover:bg-[#38d850] transition-colors cursor-pointer group relative">
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Fullscreen</span>
                  </div>
                </div>
                {/* Spacer for symmetry - no title text */}
                <div className="flex-1"></div>
              </div>
              
              {/* Video Container */}
              <div className="relative w-full aspect-video bg-black overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/talkio-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
