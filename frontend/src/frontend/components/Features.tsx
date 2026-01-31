'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

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
      gsap.from('.features-video-frame', {
        scrollTrigger: {
          trigger: '.features-video-frame',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        y: 32,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative bg-[#0a1628] px-6 py-20 lg:px-8 lg:py-28"
      aria-labelledby="features-heading"
    >
      {/* Spotlight hint */}
      <div className="absolute top-20 right-1/4 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[80px]" aria-hidden />
      
      <div className="mx-auto max-w-[1280px] relative">
        <h2
          id="features-heading"
          className="features-heading text-center text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl"
        >
          Everything you need to understand and act on sales calls
        </h2>
        <p className="mt-4 text-center text-sm text-white/60 max-w-3xl mx-auto">
          Twilio VoIP captures every call. AI processes it after it ends—extracting summaries, tracking context across conversations, and surfacing clear next actions. No real-time overhead. Just structured intelligence that helps reps stay on top of deals and managers see what matters.
        </p>
        {/* Mac-style Video Frame */}
        <div className="features-video-frame mt-14 w-full">
          <div 
            className="relative rounded-2xl overflow-hidden shadow-2xl bg-white mx-auto max-w-6xl"
            style={{
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.3), 0 0 120px rgba(59, 130, 246, 0.15), 0 20px 40px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Mac-style Title Bar with white background */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e] shadow-inner hover:bg-[#ff6f67] transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-inner hover:bg-[#ffcd3e] transition-colors cursor-pointer"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29] shadow-inner hover:bg-[#38d850] transition-colors cursor-pointer"></div>
              </div>
              {/* Spacer for symmetry */}
              <div className="flex-1"></div>
            </div>
            
            {/* Video Container */}
            <div className="relative w-full bg-black">
              <video
                loop
                autoPlay
                muted
                playsInline
                preload="auto"
                className="w-full h-auto"
                style={{ maxHeight: '80vh' }}
              >
                <source src="/talkio-features-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
