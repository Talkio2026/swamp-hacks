'use client'

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProductSummary } from './components/ProductSummary'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ForReps } from './components/ForReps'
import { ForManagers } from './components/ForManagers'
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
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Extended photo background: covers navbar + hero + ProductSummary with smooth fade */}
      <div
        className="relative overflow-visible shadow-2xl shadow-[#1e3a5f]/40"
        style={{ backgroundImage: "url('/photos/2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}
      >
        {/* Gradient overlay: darkens top, fades to ocean color at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 via-60% to-[#1e3a5f]/90" aria-hidden />
        <div className="relative z-10">
          <Navbar />
          <Hero />
          <ProductSummary />
        </div>
      </div>

      <main ref={mainRef} className="relative">
        <Features />
        <HowItWorks />
        <ForReps />
        <ForManagers />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
