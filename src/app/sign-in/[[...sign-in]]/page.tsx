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
        <div className="w-full max-w-[420px] rounded-3xl bg-white/10 border border-white/20 shadow-2xl shadow-black/20 backdrop-blur-xl p-8 text-center flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="inline-block mb-6">
            <span 
              className="text-3xl font-normal text-white"
              style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
            >
              Talkio
            </span>
          </Link>

          {/* Welcome text */}
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm mb-8">Sign in to continue to your dashboard</p>

          {/* Inner box containing all login options - white pastel solid */}
          <div className="w-full rounded-2xl bg-[#f0f4f8] p-6 flex flex-col items-center">
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
                  
                  // Google button - HIGHLIGHTED on pastel bg
                  socialButtonsBlockButton: `
                    bg-white 
                    border-2 border-slate-200 
                    text-slate-700 
                    rounded-xl 
                    h-14
                    shadow-md
                    shadow-slate-200/50
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-slate-50 
                    hover:border-slate-300 
                    hover:scale-[1.03]
                    hover:shadow-lg
                    hover:shadow-slate-300/50
                    active:scale-[0.98]
                  `,
                  socialButtonsBlockButtonText: 'text-slate-700 font-bold text-sm tracking-wide',
                  socialButtonsProviderIcon: 'w-6 h-6',
                  socialButtonsBlockButtonArrow: 'hidden',
                  
                  // Divider centered
                  dividerLine: 'bg-slate-300',
                  dividerText: 'text-slate-400 text-xs bg-[#f0f4f8] px-4',
                  dividerRow: 'my-5 w-full flex items-center justify-center',
                  
                  // Form fields - highlighted label on pastel
                  formFieldLabel: 'text-slate-600 font-semibold text-sm mb-2 block w-full text-center',
                  formFieldInput: `
                    bg-white 
                    border border-slate-200 
                    text-slate-700 
                    text-center
                    placeholder:text-slate-400 
                    rounded-xl 
                    h-12
                    transition-all 
                    duration-300
                    focus:bg-white
                    focus:border-slate-400 
                    focus:ring-0
                    focus:shadow-md
                    focus:shadow-slate-200/50
                    hover:border-slate-300
                  `,
                  
                  // Continue button on pastel
                  formButtonPrimary: `
                    bg-slate-700 
                    text-white 
                    font-semibold 
                    rounded-xl 
                    h-12 
                    border border-slate-600 
                    w-full
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-slate-800 
                    hover:border-slate-700
                    hover:scale-[1.02]
                    hover:shadow-lg
                    hover:shadow-slate-400/30
                    active:scale-[0.98]
                  `,
                  
                  // Footer elements
                  footerAction: 'hidden',
                  footerActionText: 'hidden',
                  footerActionLink: 'hidden',
                  footer: 'hidden',
                  
                  // Other elements on pastel
                  identityPreview: 'bg-white border border-slate-200 rounded-xl',
                  identityPreviewText: 'text-slate-700 text-center',
                  identityPreviewEditButton: 'text-slate-500 hover:text-slate-700 transition-colors',
                  formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600 transition-colors',
                  otpCodeFieldInput: 'bg-white border border-slate-200 text-slate-700 rounded-xl focus:border-slate-400 text-center',
                  formResendCodeLink: 'text-slate-500 hover:text-slate-700 transition-colors',
                  alertText: 'text-slate-600 text-center',
                  formFieldErrorText: 'text-red-500 text-xs mt-1 text-center',
                  
                  // Layout ALL centered
                  main: 'gap-4 w-full flex flex-col items-center',
                  form: 'w-full gap-4 flex flex-col items-center',
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
          <p className="mt-8 text-white/40 text-sm">
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
