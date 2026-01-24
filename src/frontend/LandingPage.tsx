import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { HowItWorks } from './components/HowItWorks'
import { ForReps } from './components/ForReps'
import { ForManagers } from './components/ForManagers'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <main className="bg-black">
        <Features />
        <HowItWorks />
        <ForReps />
        <ForManagers />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}
