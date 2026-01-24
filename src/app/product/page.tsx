'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'key-features', label: 'Key Features' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'integration', label: 'Integration' },
] as const;

export default function ProductPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-title', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
      });
      gsap.from('.product-content', {
        y: 32,
        opacity: 0,
        duration: 0.5,
        delay: 0.2,
        ease: 'power3.out',
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Intersection observer to track active section
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(`product-${id}`);
      if (element) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setActiveSection(id);
              }
            });
          },
          { rootMargin: '-20% 0px -70% 0px' }
        );
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`product-${id}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0a0a0b]">
      {/* Subtle background gradient/vignette */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#0d0d0f] to-[#0a0a0b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-white/[0.015] rounded-full blur-[150px]" />
      </div>

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-8 lg:px-12 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-normal text-white transition-opacity hover:opacity-80"
            style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
          >
            Talkio
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-2 text-sm font-medium text-black transition-all hover:bg-white/90"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative pt-32 px-8 lg:px-12 pb-32" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="mx-auto max-w-[1400px]">
          {/* Main content with sidebar */}
          <div className="product-content flex gap-16 lg:gap-24">
            {/* Sidebar Navigation */}
            <nav className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-32">
                <div className="text-xs font-medium text-white/30 uppercase tracking-wider mb-5">
                  On this page
                </div>
                <ul className="space-y-0.5">
                  {SECTIONS.map(({ id, label }) => (
                    <li key={id}>
                      <button
                        onClick={() => scrollToSection(id)}
                        className={`w-full text-left px-3 py-2.5 rounded-md text-[15px] transition-all duration-200 ${
                          activeSection === id
                            ? 'text-white font-medium bg-white/[0.06]'
                            : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0b]/95 backdrop-blur-xl border-t border-white/[0.06] p-4 z-40">
              <div className="flex gap-2 overflow-x-auto pb-safe">
                {SECTIONS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                      activeSection === id
                        ? 'bg-white/15 text-white font-medium'
                        : 'bg-white/[0.04] text-white/50 hover:text-white hover:bg-white/[0.08]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="flex-1 max-w-[900px] lg:pb-0 pb-24">
              {/* Page Title */}
              <div className="product-title mb-16 pt-8">
                <h1 className="text-[56px] lg:text-[64px] font-bold tracking-[-0.02em] text-white/95 leading-[1.1]">
                  Introduction
                </h1>
                <p className="mt-5 text-[26px] lg:text-[30px] font-medium text-white/50 leading-[1.3]">
                  Introduction to the Talkio Post-Call Intelligence Platform
                </p>
              </div>

              {/* Overview */}
              <section id="product-overview" className="scroll-mt-32 mb-20">
                <h2 className="text-[32px] lg:text-[36px] font-bold tracking-[-0.01em] text-white/90 mb-6">
                  Overview
                </h2>
                <div className="space-y-6">
                  <p className="text-[20px] lg:text-[22px] text-white/55 leading-[1.8]">
                    Talkio is a <span className="text-white/80 font-medium">post-call AI analysis platform</span> that transforms your sales conversations into actionable intelligence.
                  </p>
                  <p className="text-[20px] lg:text-[22px] text-white/55 leading-[1.8]">
                    No more manual note-taking or forgotten follow-ups. Every call is automatically processed to give you:
                  </p>
                  <ul className="space-y-3 text-[20px] lg:text-[22px] text-white/55 leading-[1.8] pl-1">
                    <li className="flex items-start gap-4">
                      <span className="text-white/30 mt-1">—</span>
                      <span>Structured summaries with key discussion points</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-white/30 mt-1">—</span>
                      <span>Automatically extracted action items</span>
                    </li>
                    <li className="flex items-start gap-4">
                      <span className="text-white/30 mt-1">—</span>
                      <span>Persistent context across all client interactions</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* How It Works */}
              <section id="product-how-it-works" className="scroll-mt-32 mb-20">
                <h2 className="text-[32px] lg:text-[36px] font-bold tracking-[-0.01em] text-white/90 mb-6">
                  How It Works
                </h2>
                <div className="space-y-6">
                  <p className="text-[20px] lg:text-[22px] text-white/55 leading-[1.8]">
                    Talkio operates entirely post-call, meaning there's no real-time overhead during your conversations.
                  </p>
                  <div className="space-y-6 mt-10">
                    {[
                      { step: '01', title: 'Call Recording', desc: 'Calls are captured via Twilio VoIP with automatic transcription and speaker separation. Both parties are clearly identified in the transcript.' },
                      { step: '02', title: 'AI Analysis', desc: 'After the call ends, our AI processes the transcript to extract key information—summaries, sentiment, objections, and next steps.' },
                      { step: '03', title: 'Structured Output', desc: 'You receive clean, organized data: summaries, action items, and context—all searchable and linked to the client record.' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-6">
                        <div className="text-[18px] font-medium text-white/25 flex-shrink-0 w-8">
                          {item.step}
                        </div>
                        <div>
                          <div className="text-[20px] font-semibold text-white/80 mb-2">{item.title}</div>
                          <p className="text-[18px] lg:text-[20px] text-white/50 leading-[1.7]">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section id="product-key-features" className="scroll-mt-32 mb-20">
                <h2 className="text-[32px] lg:text-[36px] font-bold tracking-[-0.01em] text-white/90 mb-6">
                  Key Features
                </h2>
                <div className="grid gap-8 sm:grid-cols-2 mt-10">
                  {[
                    { name: 'Smart Summaries', desc: 'AI-generated call summaries highlighting key discussion points, decisions made, and outcomes.' },
                    { name: 'Action Tracking', desc: 'Automatic extraction of follow-up tasks with suggested dates and clear intent.' },
                    { name: 'Client Context', desc: 'Persistent memory across all client interactions. Never lose context between calls.' },
                    { name: 'Team Dashboard', desc: 'Manager visibility into all calls, performance metrics, and team activity.' },
                    { name: 'Search & Filter', desc: 'Find any conversation instantly. Search by client, topic, date, or outcome.' },
                    { name: 'Secure Storage', desc: 'All call data encrypted and securely stored. Full compliance with data regulations.' },
                  ].map((feature) => (
                    <div key={feature.name}>
                      <div className="text-[18px] font-semibold text-white/80 mb-2">{feature.name}</div>
                      <p className="text-[17px] lg:text-[18px] text-white/45 leading-[1.7]">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Use Cases */}
              <section id="product-use-cases" className="scroll-mt-32 mb-20">
                <h2 className="text-[32px] lg:text-[36px] font-bold tracking-[-0.01em] text-white/90 mb-6">
                  Use Cases
                </h2>
                <div className="grid gap-12 lg:grid-cols-2 mt-10">
                  <div>
                    <div className="text-[20px] font-semibold text-white/80 mb-4">For Sales Reps</div>
                    <ul className="space-y-3 text-[17px] lg:text-[18px] text-white/50 leading-[1.7]">
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Focus on the conversation, not note-taking
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Never miss a follow-up action or deadline
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Quick context refresh before every call
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Build stronger client relationships with full history
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-[20px] font-semibold text-white/80 mb-4">For Managers</div>
                    <ul className="space-y-3 text-[17px] lg:text-[18px] text-white/50 leading-[1.7]">
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Visibility into all team call activity
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Track deal progress and outcomes at scale
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Identify coaching opportunities from real calls
                      </li>
                      <li className="flex items-start gap-4">
                        <span className="text-white/25 mt-0.5">—</span>
                        Ensure follow-ups are happening on schedule
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Integration */}
              <section id="product-integration" className="scroll-mt-32 mb-20">
                <h2 className="text-[32px] lg:text-[36px] font-bold tracking-[-0.01em] text-white/90 mb-6">
                  Integration
                </h2>
                <div className="space-y-6">
                  <p className="text-[20px] lg:text-[22px] text-white/55 leading-[1.8]">
                    Talkio is built on <span className="text-white/80 font-medium">Twilio</span> for reliable VoIP and call recording. Setup is seamless with no complex configuration required.
                  </p>
                  <div className="grid gap-8 sm:grid-cols-3 mt-10">
                    <div>
                      <div className="text-[18px] font-semibold text-white/80 mb-1">Twilio VoIP</div>
                      <div className="text-[16px] text-white/40">Call capture & recording</div>
                    </div>
                    <div>
                      <div className="text-[18px] font-semibold text-white/80 mb-1">AI Processing</div>
                      <div className="text-[16px] text-white/40">Gemini-powered analysis</div>
                    </div>
                    <div>
                      <div className="text-[18px] font-semibold text-white/80 mb-1">Cloud Storage</div>
                      <div className="text-[16px] text-white/40">Secure & scalable</div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
