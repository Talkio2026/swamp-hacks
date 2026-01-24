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
      className="relative bg-[#E9EDF1] px-6 py-20 lg:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px]">
        <div className="rep-content grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#7D9AB3]/30 bg-[#7D9AB3]/15 px-3 py-1 text-xs font-medium text-[#5a7a94]">
              For Sales Reps
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Never miss a follow-up. Never forget context.
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              After every call, you get a clean summary of what happened, what was discussed, and what needs to happen next. No note-taking during calls, no scrambling to remember details.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-[#7D9AB3] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Auto-generated summaries</strong> with key discussion points
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-[#7D9AB3] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Clear next actions</strong> with suggested follow-up dates
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-[#7D9AB3] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-slate-600">
                  <strong className="text-slate-900">Full client history</strong> available before every call
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-[#CAD5DF] bg-white/90 backdrop-blur-sm p-6 shadow-lg">
            <div className="space-y-4">
              <div className="rounded-lg border border-[#CAD5DF] bg-[#F3F5F8] p-4">
                <div className="text-xs font-medium text-[#7D9AB3] uppercase tracking-wide">Call Summary</div>
                <div className="mt-2 text-sm text-slate-700">
                  Discussed Q1 budget concerns. Client interested in annual plan but needs CFO approval. Pricing objection on enterprise tier.
                </div>
              </div>
              <div className="rounded-lg border border-[#9AAFC2] bg-[#E9EDF1] p-4">
                <div className="text-xs font-medium text-[#5a7a94] uppercase tracking-wide">Next Action</div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">Follow-up call scheduled</span>
                    <span className="font-medium text-slate-900">Jan 28, 2:00 PM</span>
                  </div>
                  <div className="text-xs text-[#7D9AB3]">
                    Intent: Present revised pricing with CFO on call
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-[#CAD5DF] bg-[#F3F5F8] p-4">
                <div className="text-xs font-medium text-[#7D9AB3] uppercase tracking-wide">Key Points</div>
                <ul className="mt-2 space-y-1 text-xs text-slate-600">
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
