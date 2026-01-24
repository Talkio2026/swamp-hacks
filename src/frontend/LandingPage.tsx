'use client'

import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProductSummary } from './components/ProductSummary'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ForReps } from './components/ForReps'
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
    <div className="min-h-screen bg-[#0a1628]">
      {/* Spotlight overlay effects */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.03] rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-[#1e3a5f]/30 rounded-full blur-[80px]" />
      </div>

      {/* Extended photo background: covers navbar + hero + ProductSummary with smooth fade */}
      <div
        className="relative overflow-visible"
        style={{ backgroundImage: "url('/photos/2.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', backgroundAttachment: 'fixed' }}
      >
        {/* Gradient overlay: darkens top, fades to bluish-black at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#0a1628]/70 via-60% to-[#0a1628]" aria-hidden />
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
      </main>
      <Footer />
    </div>
  )
}
