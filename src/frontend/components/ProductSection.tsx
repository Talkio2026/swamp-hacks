'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'key-features', label: 'Key Features' },
  { id: 'use-cases', label: 'Use Cases' },
  { id: 'integration', label: 'Integration' },
] as const;

export function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.product-title', {
        scrollTrigger: {
          trigger: '.product-title',
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
      const offset = 100; // Account for fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="product"
      className="relative bg-[#0a1628] px-6 py-20 lg:px-8 lg:py-28"
    >
      {/* Background accents */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px]" aria-hidden />
      <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[80px]" aria-hidden />

      <div className="mx-auto max-w-[1280px] relative">
        {/* Header */}
        <div className="product-title text-center mb-12">
          <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 mb-4">
            Product Documentation
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Understanding Talkio
          </h2>
          <p className="mt-4 text-base text-white/60 max-w-2xl mx-auto">
            A complete guide to how Talkio transforms your sales calls into structured, actionable intelligence.
          </p>
        </div>

        {/* Main content with sidebar */}
        <div className="flex gap-8 lg:gap-12">
          {/* Sidebar Navigation */}
          <nav className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-28">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                On this page
              </div>
              <ul className="space-y-1">
                {SECTIONS.map(({ id, label }) => (
                  <li key={id}>
                    <button
                      onClick={() => scrollToSection(id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                        activeSection === id
                          ? 'bg-white/10 text-white font-medium border-l-2 border-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
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
          <div className="lg:hidden w-full mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm transition-all duration-200 ${
                    activeSection === id
                      ? 'bg-white/20 text-white font-medium'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Sections */}
          <div className="flex-1 space-y-12 lg:space-y-16">
            {/* Overview */}
            <div id="product-overview" className="scroll-mt-28">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">📋</span>
                Overview
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <p className="text-white/70 leading-relaxed mb-4">
                  Talkio is a <span className="text-white font-medium">post-call AI analysis platform</span> that transforms your sales conversations into actionable intelligence.
                </p>
                <p className="text-white/70 leading-relaxed mb-4">
                  No more manual note-taking or forgotten follow-ups. Every call is automatically processed to give you:
                </p>
                <ul className="space-y-2 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Structured summaries with key discussion points</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Automatically extracted action items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-emerald-400 mt-1">✓</span>
                    <span>Persistent context across all client interactions</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* How It Works */}
            <div id="product-how-it-works" className="scroll-mt-28">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">⚙️</span>
                How It Works
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <p className="text-white/70 leading-relaxed mb-6">
                  Talkio operates entirely post-call, meaning there's no real-time overhead during your conversations.
                </p>
                <div className="space-y-4">
                  {[
                    { step: '1', title: 'Call Recording', desc: 'Calls are captured via Twilio VoIP with automatic transcription and speaker separation. Both parties are clearly identified in the transcript.', color: 'bg-blue-500/20 text-blue-300' },
                    { step: '2', title: 'AI Analysis', desc: 'After the call ends, our AI processes the transcript to extract key information—summaries, sentiment, objections, and next steps.', color: 'bg-purple-500/20 text-purple-300' },
                    { step: '3', title: 'Structured Output', desc: 'You receive clean, organized data: summaries, action items, and context—all searchable and linked to the client record.', color: 'bg-emerald-500/20 text-emerald-300' },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                      <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center font-bold flex-shrink-0`}>
                        {item.step}
                      </div>
                      <div>
                        <div className="font-medium text-white mb-1">{item.title}</div>
                        <p className="text-sm text-white/60">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div id="product-key-features" className="scroll-mt-28">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">✨</span>
                Key Features
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { name: 'Smart Summaries', desc: 'AI-generated call summaries highlighting key discussion points, decisions made, and outcomes.', icon: '📝' },
                    { name: 'Action Tracking', desc: 'Automatic extraction of follow-up tasks with suggested dates and clear intent.', icon: '✅' },
                    { name: 'Client Context', desc: 'Persistent memory across all client interactions. Never lose context between calls.', icon: '🧠' },
                    { name: 'Team Dashboard', desc: 'Manager visibility into all calls, performance metrics, and team activity.', icon: '📊' },
                    { name: 'Search & Filter', desc: 'Find any conversation instantly. Search by client, topic, date, or outcome.', icon: '🔍' },
                    { name: 'Secure Storage', desc: 'All call data encrypted and securely stored. Full compliance with data regulations.', icon: '🔒' },
                  ].map((feature) => (
                    <div key={feature.name} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                      <div>
                        <div className="font-medium text-white mb-1">{feature.name}</div>
                        <p className="text-sm text-white/60">{feature.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div id="product-use-cases" className="scroll-mt-28">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">💼</span>
                Use Cases
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-300">👤</span>
                      <span className="font-medium text-white">For Sales Reps</span>
                    </div>
                    <ul className="space-y-3 text-sm text-white/60">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        Focus on the conversation, not note-taking
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        Never miss a follow-up action or deadline
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        Quick context refresh before every call
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">→</span>
                        Build stronger client relationships with full history
                      </li>
                    </ul>
                  </div>
                  <div className="p-5 rounded-xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300">👥</span>
                      <span className="font-medium text-white">For Managers</span>
                    </div>
                    <ul className="space-y-3 text-sm text-white/60">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">→</span>
                        Visibility into all team call activity
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">→</span>
                        Track deal progress and outcomes at scale
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">→</span>
                        Identify coaching opportunities from real calls
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">→</span>
                        Ensure follow-ups are happening on schedule
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration */}
            <div id="product-integration" className="scroll-mt-28">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg">🔗</span>
                Integration
              </h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 lg:p-8">
                <p className="text-white/70 leading-relaxed mb-6">
                  Talkio is built on <span className="text-white font-medium">Twilio</span> for reliable VoIP and call recording. Setup is seamless with no complex configuration required.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                    <div className="text-2xl mb-2">📞</div>
                    <div className="text-sm font-medium text-white">Twilio VoIP</div>
                    <div className="text-xs text-white/50 mt-1">Call capture & recording</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                    <div className="text-2xl mb-2">🤖</div>
                    <div className="text-sm font-medium text-white">AI Processing</div>
                    <div className="text-xs text-white/50 mt-1">Gemini-powered analysis</div>
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
                    <div className="text-2xl mb-2">☁️</div>
                    <div className="text-sm font-medium text-white">Cloud Storage</div>
                    <div className="text-xs text-white/50 mt-1">Secure & scalable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
