import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { 
  Phone, 
  Mic, 
  BarChart3, 
  Zap, 
  CheckCircle,
  ArrowRight,
} from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Redirect if already signed in */}
      <SignedIn>
        {redirect('/clients')}
      </SignedIn>

      {/* Landing page for non-authenticated users */}
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">T</span>
                </div>
                <span className="font-semibold text-lg">Talkio</span>
              </div>
              
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-5xl font-bold tracking-tight mb-6">
                AI-Powered Sales Call Copilot
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Get real-time coaching during calls and detailed post-call analysis. 
                Improve your sales performance with AI-driven insights.
              </p>
              <div className="flex items-center justify-center gap-4">
                <SignUpButton mode="modal">
                  <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </SignUpButton>
                <Link 
                  href="#features"
                  className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="max-w-7xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Everything You Need to Win</h2>
              <p className="text-muted-foreground">
                Powerful features to help your sales team close more deals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Live Copilot</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time AI suggestions during calls to help you stay on track and handle objections
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Call Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Detailed scoring and insights on every call with actionable coaching tips
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Call Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic recording and transcription of all sales calls for review
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-card border rounded-lg hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Sales Playbooks</h3>
                <p className="text-sm text-muted-foreground">
                  Define your methodology and ensure consistent execution across your team
                </p>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  Close More Deals with AI Coaching
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Improve Win Rates</h3>
                      <p className="text-sm text-muted-foreground">
                        Get real-time guidance to navigate objections and close deals faster
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Faster Onboarding</h3>
                      <p className="text-sm text-muted-foreground">
                        New reps learn your sales methodology quickly with AI coaching
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Data-Driven Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Track performance metrics and identify areas for improvement
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Consistent Execution</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure every rep follows your proven sales playbook
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Score</span>
                    <span className="text-2xl font-bold text-green-500">87</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Opening</span>
                        <span className="text-sm font-medium">92</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: '92%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Discovery</span>
                        <span className="text-sm font-medium">85</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Presentation</span>
                        <span className="text-sm font-medium">88</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '88%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Closing</span>
                        <span className="text-sm font-medium">83</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '83%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Get detailed performance insights after every call
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-7xl mx-auto px-6 py-16">
            <div className="bg-primary text-primary-foreground rounded-2xl p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Ready to Transform Your Sales Calls?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join sales teams using AI to close more deals
              </p>
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-background text-foreground rounded-lg font-medium hover:bg-background/90 transition-colors">
                  Get Started Free
                </button>
              </SignUpButton>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t bg-card/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-xs">T</span>
                  </div>
                  <span className="font-semibold">Talkio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  © 2026 Talkio. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </SignedOut>
    </>
  )
}
