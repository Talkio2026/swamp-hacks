import type { Metadata } from 'next'
import { Inter, Lora } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '600', '700'],
  variable: '--font-inter',
})

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-lora',
})

export const metadata: Metadata = {
  title: 'Talkio - AI Sales Call Copilot',
  description: 'AI-powered sales call analysis and coaching platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    return (
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
          <div className="flex min-h-screen items-center justify-center p-6 text-center">
            <div className="max-w-lg space-y-3">
              <h1 className="text-xl font-semibold">Missing Clerk publishable key</h1>
              <p className="text-sm text-muted-foreground">
                Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> in your deployment
                environment to enable authentication.
              </p>
            </div>
          </div>
        </body>
      </html>
    )
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="scroll-smooth">
        <body className={`${inter.variable} ${lora.variable} font-sans antialiased`}>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}
