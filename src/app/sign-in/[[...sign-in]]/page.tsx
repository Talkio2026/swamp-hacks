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

      {/* Header - positioned absolutely so it doesn't affect centering */}
      <header className="absolute top-0 left-0 z-20 px-6 py-6">
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

      {/* Main content - perfectly centered on screen */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        {/* Glass card container - more padding */}
        <div className="w-full max-w-[460px] rounded-3xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 backdrop-blur-xl p-10 text-center flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="inline-block mb-8">
            <span 
              className="text-3xl font-normal text-white"
              style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
            >
              Talkio
            </span>
          </Link>

          {/* Welcome text */}
          <h1 className="text-xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm mb-10">Sign in to continue to your dashboard</p>

          {/* Inner box containing all login options - glass effect */}
          <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 flex flex-col items-center">
            <SignIn 
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  rootBox: 'w-full flex justify-center',
                  card: 'bg-transparent shadow-none p-0 w-full border-none flex flex-col items-center',
                  cardBox: 'shadow-none bg-transparent w-full flex flex-col items-center',
                  header: 'hidden',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  
                  // Google button - glass style
                  socialButtonsBlockButton: `
                    bg-white/15 
                    border border-white/25 
                    text-white 
                    rounded-xl 
                    h-14
                    backdrop-blur-sm
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-white/25 
                    hover:border-white/40 
                    hover:scale-[1.03]
                    hover:shadow-lg
                    hover:shadow-white/10
                    active:scale-[0.98]
                  `,
                  socialButtonsBlockButtonText: 'text-white font-bold text-sm tracking-wide',
                  socialButtonsProviderIcon: 'w-6 h-6',
                  socialButtonsBlockButtonArrow: 'hidden',
                  
                  // Divider - glass style
                  dividerLine: 'bg-white/30',
                  dividerText: 'text-white/50 text-xs bg-transparent px-4',
                  dividerRow: 'my-6 w-full flex items-center justify-center',
                  
                  // Form fields - glass style
                  formFieldLabel: 'text-white/80 font-semibold text-sm mb-2 block w-full text-center',
                  formFieldInput: `
                    bg-white/10 
                    border border-white/20 
                    text-white 
                    text-center
                    placeholder:text-white/40 
                    rounded-xl 
                    h-12
                    transition-all 
                    duration-300
                    focus:bg-white/15
                    focus:border-white/40 
                    focus:ring-0
                    focus:shadow-lg
                    focus:shadow-white/10
                    hover:border-white/30
                  `,
                  
                  // Continue button - glass style
                  formButtonPrimary: `
                    bg-white/20 
                    text-white 
                    font-semibold 
                    rounded-full 
                    h-12 
                    border border-white/25 
                    w-full
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-white/30 
                    hover:border-white/40
                    hover:scale-[1.02]
                    hover:shadow-lg
                    hover:shadow-white/15
                    active:scale-[0.98]
                  `,
                  
                  // Footer elements - hide all
                  footerAction: '!hidden',
                  footerActionText: '!hidden',
                  footerActionLink: '!hidden',
                  footer: '!hidden',
                  footerPages: '!hidden',
                  footerPagesLink: '!hidden',
                  badge: '!hidden',
                  
                  // Other elements - glass style
                  identityPreview: 'bg-white/10 border border-white/20 rounded-xl',
                  identityPreviewText: 'text-white text-center',
                  identityPreviewEditButton: 'text-white/60 hover:text-white transition-colors',
                  formFieldInputShowPasswordButton: 'text-white/50 hover:text-white transition-colors',
                  otpCodeFieldInput: 'bg-white/10 border border-white/20 text-white rounded-xl focus:border-white/40 text-center',
                  formResendCodeLink: 'text-white/60 hover:text-white transition-colors',
                  alertText: 'text-white/80 text-center',
                  formFieldErrorText: 'text-red-300 text-xs mt-1 text-center',
                  
                  // Layout ALL centered with more gaps
                  main: 'gap-5 w-full flex flex-col items-center',
                  form: 'w-full gap-5 flex flex-col items-center',
                  formFieldRow: 'w-full flex flex-col items-center',
                  socialButtons: 'w-full flex flex-col items-center',
                },
                layout: {
                  socialButtonsPlacement: 'top',
                  socialButtonsVariant: 'blockButton',
                },
              }}
            />
          </div>

          {/* Footer link */}
          <p className="mt-10 text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link 
              href="/sign-up" 
              className="text-white/70 hover:text-white transition-all duration-300 hover:underline underline-offset-4"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
