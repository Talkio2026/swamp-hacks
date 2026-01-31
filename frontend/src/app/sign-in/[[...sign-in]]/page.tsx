'use client'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

export default function SignInPage() {
  // #region agent log
  useEffect(() => {
    // Log page render
    fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sign-in/page.tsx:useEffect',message:'Page rendered',data:{timestamp:new Date().toISOString()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    
    // Wait for Clerk to render, then inspect DOM
    const checkClerkElements = () => {
      const socialButton = document.querySelector('[class*="socialButtonsBlockButton"]');
      const allButtons = document.querySelectorAll('button');
      const googleButton = Array.from(allButtons).find(btn => btn.textContent?.includes('Google'));
      
      fetch('http://127.0.0.1:7242/ingest/e04a3cda-9882-48bd-9028-74165ea5ab43',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sign-in/page.tsx:checkClerkElements',message:'Clerk DOM inspection',data:{
        socialButtonFound: !!socialButton,
        socialButtonClasses: socialButton?.className || 'NOT_FOUND',
        googleButtonFound: !!googleButton,
        googleButtonClasses: googleButton?.className || 'NOT_FOUND',
        googleButtonParentClasses: googleButton?.parentElement?.className || 'NOT_FOUND',
        allButtonCount: allButtons.length
      },timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,C,E'})}).catch(()=>{});
    };
    
    // Check immediately and after delays to catch Clerk's async rendering
    setTimeout(checkClerkElements, 500);
    setTimeout(checkClerkElements, 1500);
    setTimeout(checkClerkElements, 3000);
  }, []);
  // #endregion

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
              className="text-2xl font-normal text-white"
              style={{ fontFamily: "'Lora', serif", fontStyle: 'italic' }}
            >
              Talkio
            </span>
          </Link>

          {/* Welcome text */}
          <h1 className="text-xl font-semibold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm mb-10">Sign in to continue to your dashboard</p>

          {/* Inner box containing all login options - pastel white */}
          <div className="w-full rounded-2xl bg-[#f0f4f8] p-8 flex flex-col items-center">
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
                  
                  // Google button - dark style with hover
                  socialButtonsBlockButton: `
                    bg-slate-800 
                    border border-slate-700 
                    text-white 
                    rounded-xl 
                    h-14
                    shadow-lg
                    shadow-slate-900/30
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-slate-700 
                    hover:border-slate-600 
                    hover:scale-[1.03]
                    hover:shadow-xl
                    hover:shadow-slate-900/40
                    active:scale-[0.98]
                  `,
                  socialButtonsBlockButtonText: 'text-white font-bold text-sm tracking-wide',
                  socialButtonsProviderIcon: 'w-6 h-6',
                  socialButtonsBlockButtonArrow: 'hidden',
                  
                  // Divider - pastel style
                  dividerLine: 'bg-slate-300',
                  dividerText: 'text-slate-400 text-xs bg-[#f0f4f8] px-4',
                  dividerRow: 'my-6 w-full flex items-center justify-center',
                  
                  // Form fields - hidden label, pastel style input
                  formFieldLabel: 'hidden',
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
                  
                  // Continue button - dark blueish black
                  formButtonPrimary: `
                    bg-slate-900 
                    text-white 
                    font-semibold 
                    rounded-full 
                    h-12 
                    border border-slate-700 
                    w-full
                    transition-all 
                    duration-300 
                    ease-out
                    hover:bg-slate-800 
                    hover:border-slate-600
                    hover:scale-[1.02]
                    hover:shadow-lg
                    hover:shadow-slate-900/50
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
                  
                  // Other elements - pastel style
                  identityPreview: 'bg-white border border-slate-200 rounded-xl',
                  identityPreviewText: 'text-slate-700 text-center',
                  identityPreviewEditButton: 'text-slate-500 hover:text-slate-700 transition-colors',
                  formFieldInputShowPasswordButton: 'text-slate-400 hover:text-slate-600 transition-colors',
                  otpCodeFieldInput: 'bg-white border border-slate-200 text-slate-700 rounded-xl focus:border-slate-400 text-center',
                  formResendCodeLink: 'text-slate-500 hover:text-slate-700 transition-colors',
                  alertText: 'text-slate-600 text-center',
                  formFieldErrorText: 'text-red-500 text-xs mt-1 text-center',
                  
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
