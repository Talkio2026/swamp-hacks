'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function ForReps() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.rep-content', {
        scrollTrigger: {
          trigger: '.rep-content',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 24,
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
      className="relative bg-[#0a1628] px-6 py-20 lg:px-8 lg:py-28"
    >
      {/* Spotlight hint */}
      <div className="absolute bottom-20 right-1/4 w-[350px] h-[350px] bg-white/[0.02] rounded-full blur-[100px]" aria-hidden />
      
      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="rep-content grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
              For Sales Reps
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              Never miss a follow-up. Never forget context.
            </h2>
            <p className="mt-4 text-sm text-white/60">
              After every call, you get a clean summary of what happened, what was discussed, and what needs to happen next. No note-taking during calls, no scrambling to remember details.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/70">
                  <strong className="text-white">Auto-generated summaries</strong> with key discussion points
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/70">
                  <strong className="text-white">Clear next actions</strong> with suggested follow-up dates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white/60 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/70">
                  <strong className="text-white">Full client history</strong> available before every call
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-xl">
            <div className="space-y-4">
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/50 uppercase tracking-wide">Call Summary</div>
                <div className="mt-2 text-sm text-white/80">
                  Discussed Q1 budget concerns. Client interested in annual plan but needs CFO approval. Pricing objection on enterprise tier.
                </div>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/10 p-4">
                <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Next Action</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/80">Follow-up call scheduled</span>
                    <span className="font-medium text-white">Jan 28, 2:00 PM</span>
                  </div>
                  <div className="text-xs text-white/50">
                    Intent: Present revised pricing with CFO on call
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="text-xs font-medium text-white/50 uppercase tracking-wide">Key Points</div>
                <ul className="mt-2 space-y-1 text-xs text-white/60">
                  <li>• Budget approval needed by Feb 1</li>
                  <li>• Competitor comparison requested</li>
                  <li>• Demo scheduled with technical team</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
