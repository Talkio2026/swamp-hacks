'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    title: 'AI-powered summaries',
    body: 'Every call generates a structured summary with key points, outcomes, and discussion highlights.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    title: 'Next-action tracking',
    body: 'Automatically extracts follow-up requirements with suggested dates, times, and clear intent.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    title: 'Persistent context',
    body: 'Client history builds across calls. Every interaction adds to a growing memory per client.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
  },
  {
    title: 'Twilio VoIP integration',
    body: 'Seamless call capture with transcripts, recordings, and metadata—all automated post-call.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
      </svg>
    ),
  },
  {
    title: 'Manager visibility',
    body: 'Track all calls with duration, outcomes, and follow-ups—organized by rep, client, and org.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    title: 'Organization hierarchy',
    body: 'Clean data separation by organization and client. No mixing, full context preservation.',
    icon: (
      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
] as const;

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.features-heading', {
        scrollTrigger: {
          trigger: '.features-heading',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        y: 32,
        opacity: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-white/40 px-6 py-14 lg:px-8 lg:py-20"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2
          id="features-heading"
          className="features-heading text-center text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl"
        >
          Everything you need to understand and act on sales calls
        </h2>
        <p className="mt-4 text-center text-sm text-slate-600 max-w-3xl mx-auto">
          Twilio VoIP captures every call. AI processes it after it ends—extracting summaries, tracking context across conversations, and surfacing clear next actions. No real-time overhead. Just structured intelligence that helps reps stay on top of deals and managers see what matters.
        </p>
        <div className="features-grid mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, body, icon }) => (
            <article
              key={title}
              className={cn(
                'feature-card group flex flex-col rounded-2xl border border-purple-200/60 bg-white/80 backdrop-blur-sm p-6 shadow-sm transition-all duration-200',
                'hover:border-purple-300/60 hover:shadow-md focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2'
              )}
            >
              <div className="mb-4 flex items-start justify-between">
                <span className="rounded-lg bg-purple-100/60 p-2">{icon}</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 flex-1 text-sm text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
