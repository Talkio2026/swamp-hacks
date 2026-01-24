import { Navbar, Hero, Features, FinalCTA, Footer } from '@/components/marketing';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  );
}
