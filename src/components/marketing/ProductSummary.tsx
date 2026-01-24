'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import Image from 'next/image';

const CORE_FEATURES = [
  {
    title: 'Post-Call AI',
    description: 'AI processes recordings instantly.',
    icon: '/icons/analytics.svg',
    x: 50, y: 8,
    // Path: center -> up -> right -> up
    path: 'M50,50 L50,30 L65,30 L65,8 L50,8',
  },
  {
    title: 'Context Memory',
    description: 'History preserved across calls.',
    icon: '/icons/context.svg',
    x: 86, y: 29,
    // Path: center -> right -> up -> right -> up
    path: 'M50,50 L68,50 L68,40 L86,40 L86,29',
  },
  {
    title: 'Action Tracking',
    description: 'Follow-ups with dates tracked.',
    icon: '/icons/data-table.svg',
    x: 86, y: 71,
    // Path: center -> right -> down -> right -> down
    path: 'M50,50 L68,50 L68,60 L86,60 L86,71',
  },
  {
    title: 'Manager Visibility',
    description: 'Track all calls in one place.',
    icon: '/icons/visibility.svg',
    x: 50, y: 92,
    // Path: center -> down -> left -> down
    path: 'M50,50 L50,70 L35,70 L35,92 L50,92',
  },
  {
    title: 'Twilio VoIP',
    description: 'Seamless call capture.',
    icon: '/icons/phonecall.svg',
    x: 14, y: 71,
    // Path: center -> left -> down -> left -> down
    path: 'M50,50 L32,50 L32,60 L14,60 L14,71',
  },
  {
    title: 'Org Hierarchy',
    description: 'Clean data separation.',
    icon: '/icons/organization.svg',
    x: 14, y: 29,
    // Path: center -> left -> up -> left -> up
    path: 'M50,50 L32,50 L32,40 L14,40 L14,29',
  },
];

export function ProductSummary() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cpu-center', {
        scrollTrigger: {
          trigger: '.cpu-board',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        scale: 0,
        opacity: 0,
        duration: 0.6,
        ease: 'back.out(1.7)',
      });
      gsap.from('.cpu-chip', {
        scrollTrigger: {
          trigger: '.cpu-board',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        scale: 0,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'back.out(1.7)',
        delay: 0.4,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative px-4 py-16 lg:px-8 lg:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-[1100px] relative z-10">
        {/* CPU Board */}
        <div className="cpu-board relative h-[600px] sm:h-[650px] lg:h-[700px]">
          
          {/* Animated zig-zag circuit lines SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden
          >
            <defs>
              {/* Glow filter */}
              <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {CORE_FEATURES.map((feature, i) => (
              <g key={i}>
                {/* Static background path */}
                <path
                  d={feature.path}
                  stroke="#3b82f6"
                  strokeOpacity="0.15"
                  strokeWidth="0.5"
                  fill="none"
                  strokeLinejoin="round"
                />
                {/* Glow path */}
                <path
                  d={feature.path}
                  stroke="#60a5fa"
                  strokeOpacity="0.1"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinejoin="round"
                  filter="url(#lineGlow)"
                />
                {/* Animated dotted path */}
                <path
                  d={feature.path}
                  stroke="#60a5fa"
                  strokeOpacity="0.9"
                  strokeWidth="0.4"
                  strokeDasharray="1.5 2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="animate-circuit"
                  style={{
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
                {/* Corner nodes */}
                <circle
                  cx={feature.x}
                  cy={feature.y}
                  r="1"
                  fill="#60a5fa"
                  fillOpacity="0.6"
                />
              </g>
            ))}

            {/* Junction nodes at turns */}
            {/* Top path turns */}
            <circle cx="50" cy="30" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="65" cy="30" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="65" cy="8" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Top-right path turns */}
            <circle cx="68" cy="50" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="68" cy="40" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="86" cy="40" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Bottom-right path turns */}
            <circle cx="68" cy="60" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="86" cy="60" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Bottom path turns */}
            <circle cx="50" cy="70" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="35" cy="70" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="35" cy="92" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Bottom-left path turns */}
            <circle cx="32" cy="50" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="32" cy="60" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="14" cy="60" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Top-left path turns */}
            <circle cx="32" cy="40" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            <circle cx="14" cy="40" r="0.8" fill="#3b82f6" fillOpacity="0.5" />
            {/* Center node */}
            <circle cx="50" cy="50" r="1.5" fill="#60a5fa" fillOpacity="0.8" />
          </svg>

          {/* CSS for animated lines */}
          <style jsx>{`
            .animate-circuit {
              animation: flowCircuit 1.2s linear infinite;
            }
            @keyframes flowCircuit {
              0% {
                stroke-dashoffset: 0;
              }
              100% {
                stroke-dashoffset: -8;
              }
            }
          `}</style>

          {/* Center CPU core */}
          <div className="cpu-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              {/* Outer glow rings */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl scale-150" />
              <div className="absolute inset-0 rounded-2xl bg-blue-400/10 blur-2xl scale-[2]" />
              
              {/* Main chip */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-blue-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-sm sm:text-base tracking-wider">TALKIO</div>
                  <div className="text-blue-300/50 text-[8px] sm:text-[10px] mt-0.5">AI ENGINE</div>
                  <div className="mt-2 w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature chips at positions */}
          {CORE_FEATURES.map((feature, i) => (
            <div
              key={i}
              className="cpu-chip absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${feature.x}%`,
                top: `${feature.y}%`,
              }}
            >
              <FeatureChip feature={feature} />
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

function FeatureChip({ feature }: { feature: typeof CORE_FEATURES[0] }) {
  return (
    <div className="group w-[160px] sm:w-[190px] lg:w-[220px]">
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-blue-500/20 blur-lg scale-110 group-hover:bg-blue-400/30 group-hover:scale-125 transition-all duration-300" />
        
        {/* Card */}
        <div className="relative flex flex-col items-center p-4 sm:p-5 rounded-xl border border-blue-500/30 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 group-hover:border-blue-400/50 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] group-hover:scale-105">
          
          {/* Icon */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mb-3">
            <Image
              src={feature.icon}
              alt={feature.title}
              fill
              className="object-contain"
            />
          </div>

          {/* Title */}
          <h4 className="text-sm sm:text-base font-semibold text-blue-100 text-center leading-tight">
            {feature.title}
          </h4>

          {/* Description */}
          <p className="text-[10px] sm:text-xs text-blue-300/60 text-center leading-tight mt-1">
            {feature.description}
          </p>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-blue-400/50 rounded-tl" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-blue-400/50 rounded-tr" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-blue-400/50 rounded-bl" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-400/50 rounded-br" />
        </div>
      </div>
    </div>
  );
}
