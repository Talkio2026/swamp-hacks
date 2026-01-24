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
      className="relative bg-[#7D9AB3] px-6 py-20 lg:px-8 lg:py-28"
    >
      {/* Frosted glass top transition */}
      <div className="absolute top-0 left-0 right-0 h-32 backdrop-blur-2xl bg-gradient-to-b from-[#F3F5F8]/80 to-transparent" aria-hidden />
      
      <div className="mx-auto max-w-[1280px] relative z-10">
        <h2 className="how-heading text-center text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
          How it works
        </h2>
        <p className="mt-4 text-center text-sm text-white/90 max-w-2xl mx-auto">
          Simple, automated workflow. No manual data entry, no real-time disruption.
        </p>

        {/* Map-like dotted path connecting steps */}
        <div className="relative mt-14">
          {/* Animated curly dotted line SVG - visible on large screens */}
          <svg
            className="absolute top-8 left-0 w-full h-24 hidden lg:block pointer-events-none"
            viewBox="0 0 1200 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden
          >
            {/* Background static path */}
            <path
              d="M50 50 C150 10, 200 90, 350 50 C500 10, 550 90, 700 50 C850 10, 900 90, 1050 50 C1100 30, 1150 70, 1150 50"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Animated flowing path */}
            <path
              d="M50 50 C150 10, 200 90, 350 50 C500 10, 550 90, 700 50 C850 10, 900 90, 1050 50 C1100 30, 1150 70, 1150 50"
              stroke="white"
              strokeOpacity="0.4"
              strokeWidth="2"
              strokeDasharray="12 20"
              strokeLinecap="round"
              fill="none"
              style={{
                animation: 'flowPath 2s linear infinite',
              }}
            />
            {/* Dot markers at each step */}
            <circle cx="50" cy="50" r="6" fill="white" fillOpacity="0.3" />
            <circle cx="350" cy="50" r="6" fill="white" fillOpacity="0.3" />
            <circle cx="700" cy="50" r="6" fill="white" fillOpacity="0.3" />
            <circle cx="1050" cy="50" r="6" fill="white" fillOpacity="0.3" />
            
            {/* Pulsing circles at steps */}
            <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="350" cy="50" r="8" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" begin="0.5s" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </circle>
            <circle cx="700" cy="50" r="8" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" begin="1s" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin="1s" />
            </circle>
            <circle cx="1050" cy="50" r="8" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="1">
              <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" begin="1.5s" />
              <animate attributeName="stroke-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" begin="1.5s" />
            </circle>
          </svg>
          
          {/* CSS animation for flowing path */}
          <style jsx>{`
            @keyframes flowPath {
              0% {
                stroke-dashoffset: 0;
              }
              100% {
                stroke-dashoffset: -32;
              }
            }
          `}</style>

          <div className="steps-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative lg:-mt-4">
            {STEPS.map((step, index) => (
              <div key={step.number} className="step-card flex flex-col relative">
                <div className="mb-2 text-4xl font-bold text-white/20">
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-white -mt-1">
                  {step.title}
                </h3>
                <p className="mt-6 text-sm text-white/60">
                  {step.description}
                </p>
                
                {/* Mobile/tablet connector line */}
                {index < STEPS.length - 1 && (
                  <div className="lg:hidden absolute -bottom-4 left-1/2 w-px h-8 border-l-2 border-dashed border-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
