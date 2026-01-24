'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  {
    number: '01',
    title: 'Call happens via Twilio',
    description: 'Sales rep connects with a client through Twilio VoIP. Call is recorded with separated transcripts.',
  },
  {
    number: '02',
    title: 'AI analyzes post-call',
    description: 'After the call ends, AI processes the transcript to generate summaries, key points, and outcomes.',
  },
  {
    number: '03',
    title: 'Next actions extracted',
    description: 'System identifies follow-up requirements, suggests dates/times, and clarifies the intent.',
  },
  {
    number: '04',
    title: 'Context preserved',
    description: 'Call data saves to the client record, building a persistent memory for future interactions.',
  },
] as const;

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.how-heading', {
        scrollTrigger: {
          trigger: '.how-heading',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.step-card', {
        scrollTrigger: {
          trigger: '.steps-grid',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
        y: 32,
        opacity: 0,
        duration: 0.55,
        stagger: 0.15,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="px-6 py-14 lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-[1280px]">
        <h2 className="how-heading text-center text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
          How it works
        </h2>
        <p className="mt-4 text-center text-sm text-slate-400 max-w-2xl mx-auto">
          Simple, automated workflow. No manual data entry, no real-time disruption.
        </p>

        <div className="steps-grid mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.number} className="step-card flex flex-col">
              <div className="mb-4 text-4xl font-bold text-white/10">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
