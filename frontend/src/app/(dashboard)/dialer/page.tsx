'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, Loader2 } from 'lucide-react'

export default function DialerPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to clients page after a brief delay
    const timer = setTimeout(() => {
      router.push('/clients')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Dialer Moved</h1>
        <p className="text-muted-foreground max-w-sm">
          The dialer is now available as a floating button in the bottom-right corner of your screen.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Redirecting...
        </div>
      </div>
    </div>
  )
}
