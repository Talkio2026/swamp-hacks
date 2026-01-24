'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export function ForManagers() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.manager-content', {
        scrollTrigger: {
          trigger: '.manager-content',
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
      className="relative bg-[#1e3a5f] px-6 py-20 lg:px-8 lg:py-28"
    >
      {/* Frosted glass top transition */}
      <div className="absolute top-0 left-0 right-0 h-32 backdrop-blur-2xl bg-gradient-to-b from-[#f8fafc]/80 to-transparent" aria-hidden />
      
      <div className="mx-auto max-w-[1280px] relative z-10">
        <div className="manager-content grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="order-2 lg:order-1 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg">
            <div className="space-y-3">
              {[
                { rep: 'Sarah Chen', calls: 12, pending: 3, status: 'active' },
                { rep: 'Mike Ross', calls: 8, pending: 1, status: 'active' },
                { rep: 'Lisa Park', calls: 15, pending: 5, status: 'needs-attention' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
                  <div>
                    <div className="font-medium text-sm text-white">{item.rep}</div>
                    <div className="text-xs text-white/60">{item.calls} calls this week</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-white/60">Pending</div>
                      <div className="text-sm font-medium text-white">{item.pending}</div>
                    </div>
                    {item.status === 'needs-attention' && (
                      <div className="h-2 w-2 rounded-full bg-orange-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white">
              For Managers
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              See what's happening. Coach where it matters.
            </h2>
            <p className="mt-4 text-sm text-white/80">
              Get complete visibility into every call without micromanaging. Track outcomes, spot patterns, and step in when deals need attention.
            </p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/90">
                  <strong className="text-white">Call tracking log</strong> organized by rep, client, and organization
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/90">
                  <strong className="text-white">Follow-up visibility</strong> with scheduled dates and intent
                </span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="h-5 w-5 text-white flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-white/90">
                  <strong className="text-white">Deal progression tracking</strong> with outcomes and timestamps
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
