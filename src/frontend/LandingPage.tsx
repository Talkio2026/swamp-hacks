'use client'

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProductSummary } from './components/ProductSummary'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ForReps } from './components/ForReps'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'
import { useEffect, useRef } from 'react'

export function LandingPage() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // #region agent log
    if (mainRef.current) {
      const main = mainRef.current;
      const rect = main.getBoundingClientRect();
      const styles = window.getComputedStyle(main);
      console.log('[DEBUG LandingPage.tsx:17] Main container dimensions', { top: rect.top, paddingTop: styles.paddingTop, marginTop: styles.marginTop });
      fetch('http://127.0.0.1:7242/ingest/a4918017-0b21-4e17-ac77-6519ee12f785',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LandingPage.tsx:14',message:'Main container dimensions',data:{top:rect.top,paddingTop:styles.paddingTop,marginTop:styles.marginTop},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H3'})}).catch(()=>{});
    }
    // #endregion
  }, []);

  return (
    <div className="min-h-screen bg-[#162d3d]">
      {/* Extended photo background: covers navbar + hero + ProductSummary with smooth fade */}
      <div
        className="relative overflow-visible"
        style={{ backgroundImage: "url('/photos/2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}
      >
        {/* Gradient overlay: darkens top, fades to ocean color at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 via-60% to-[#162d3d]" aria-hidden />
        <div className="relative z-10">
          <Navbar />
          <Hero />
          <ProductSummary />
        </div>
      </div>

      <main ref={mainRef} className="relative bg-[#162d3d]">
        {/* Grainy texture overlay */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden 
        />
        {/* Top blur transition overlay */}
        <div 
          className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#162d3d] to-transparent pointer-events-none" 
          aria-hidden 
        />
        <Features />
        <HowItWorks />
        <ForReps />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
