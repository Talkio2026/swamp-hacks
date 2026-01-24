import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div 
      className="min-h-screen relative overflow-hidden page-transition"
      style={{ 
        backgroundImage: "url('/photos/2.jpg')", 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        backgroundAttachment: 'fixed' 
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back to home</span>
        </Link>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-4">
        {/* Glass card container */}
        <div className="w-full max-w-[420px] rounded-3xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 backdrop-blur-xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/">
              <span 
                className="text-3xl font-normal text-white"
                style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
              >
                Talkio
              </span>
            </Link>
          </div>

          {/* Welcome text */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
            <p className="text-white/50 text-sm">Sign in to continue to your dashboard</p>
          </div>

          {/* Clerk SignIn with glass styling */}
          <SignIn 
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: 'w-full flex justify-center',
                card: 'bg-transparent shadow-none p-0 gap-4 w-full',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                header: 'hidden',
                socialButtonsBlockButton: 'bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 rounded-xl h-11',
                socialButtonsBlockButtonText: 'text-white/90 font-medium text-sm',
                socialButtonsProviderIcon: 'brightness-0 invert opacity-80',
                socialButtonsBlockButtonArrow: 'hidden',
                dividerLine: 'bg-white/20',
                dividerText: 'text-white/40 text-xs',
                dividerRow: 'my-4',
                formFieldLabel: 'text-white/70 text-sm font-medium',
                formFieldInput: 'bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:border-white/40 focus:ring-0 rounded-xl h-11 backdrop-blur-sm transition-all duration-300',
                formButtonPrimary: 'bg-white/20 hover:bg-white/30 text-white font-medium transition-all duration-300 rounded-xl h-11 border border-white/20 w-full',
                footerActionLink: 'text-white/70 hover:text-white transition-colors',
                identityPreview: 'bg-white/10 border border-white/20 rounded-xl',
                identityPreviewText: 'text-white',
                identityPreviewEditButton: 'text-white/70 hover:text-white',
                formFieldInputShowPasswordButton: 'text-white/50 hover:text-white',
                otpCodeFieldInput: 'bg-white/10 border border-white/20 text-white rounded-xl',
                formResendCodeLink: 'text-white/70 hover:text-white',
                alertText: 'text-white/80',
                formFieldErrorText: 'text-red-300 text-xs',
                footer: 'hidden',
                footerAction: 'hidden',
                main: 'gap-4 w-full',
                form: 'w-full gap-4',
                formFieldRow: 'w-full',
              },
              layout: {
                socialButtonsPlacement: 'top',
                socialButtonsVariant: 'blockButton',
              },
            }}
          />

          {/* Footer link */}
          <p className="mt-6 text-center text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-white/70 hover:text-white transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
