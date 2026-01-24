import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { ProductSummary } from './components/ProductSummary'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ForReps } from './components/ForReps'
import { ForManagers } from './components/ForManagers'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-purple-100/40 to-purple-50/60 relative">
      {/* Dotted background pattern */}
      <div 
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(circle, #a78bfa 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ProductSummary />
          <Features />
          <HowItWorks />
          <ForReps />
          <ForManagers />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </div>
  )
}
