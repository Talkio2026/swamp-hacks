'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Device, Call } from '@twilio/voice-sdk'
import { Button } from '@/components/ui/button'
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  X,
  Loader2,
  Delete,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected'

export function FloatingDialer() {
  const [isOpen, setIsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDeviceReady, setIsDeviceReady] = useState(false)
  
  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize Twilio Device when popup opens
  useEffect(() => {
    if (!isOpen) return

    const initDevice = async () => {
      if (deviceRef.current) return // Already initialized
      
      try {
        const response = await fetch('/api/twilio/token')
        if (!response.ok) {
          throw new Error('Failed to get token')
        }
        
        const { token } = await response.json()
        
        const device = new Device(token, {
          logLevel: 1,
          codecPreferences: ['opus', 'pcmu'],
        })

        device.on('registered', () => {
          console.log('Twilio Device registered')
          setIsDeviceReady(true)
        })

        device.on('error', (err) => {
          console.error('Twilio Device error:', err)
          setError(err.message || 'Device error')
        })

        await device.register()
        deviceRef.current = device
      } catch (err) {
        console.error('Failed to initialize Twilio Device:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize dialer')
      }
    }

    initDevice()
  }, [isOpen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deviceRef.current) {
        deviceRef.current.destroy()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Handle keyboard input for DTMF during call
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if input is focused or we're in a call
      if (callStatus === 'connected' && callRef.current) {
        const key = e.key
        if (/^[0-9*#]$/.test(key)) {
          callRef.current.sendDigits(key)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, callStatus])

  // Start call
  const handleCall = useCallback(async () => {
    if (!deviceRef.current || !phoneNumber) return

    setError(null)
    setCallStatus('connecting')

    try {
      const call = await deviceRef.current.connect({
        params: { To: phoneNumber },
      })

      callRef.current = call

      call.on('ringing', () => {
        setCallStatus('ringing')
      })

      call.on('accept', () => {
        setCallStatus('connected')
        setCallDuration(0)
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1)
        }, 1000)
      })

      call.on('disconnect', () => {
        setCallStatus('disconnected')
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        setTimeout(() => setCallStatus('idle'), 2000)
      })

      call.on('error', (err) => {
        console.error('Call error:', err)
        setError(err.message || 'Call failed')
        setCallStatus('idle')
      })

      call.on('cancel', () => {
        setCallStatus('idle')
      })

    } catch (err) {
      console.error('Failed to connect call:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect')
      setCallStatus('idle')
    }
  }, [phoneNumber])

  // End call
  const handleHangup = useCallback(() => {
    if (callRef.current) {
      callRef.current.disconnect()
      callRef.current = null
    }
  }, [])

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    if (callRef.current) {
      const newMuteState = !isMuted
      callRef.current.mute(newMuteState)
      setIsMuted(newMuteState)
    }
  }, [isMuted])

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Get status text
  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting': return 'Connecting...'
      case 'ringing': return 'Ringing...'
      case 'connected': return formatDuration(callDuration)
      case 'disconnected': return 'Call ended'
      default: return ''
    }
  }

  const isInCall = ['connecting', 'ringing', 'connected'].includes(callStatus)

  // Close popup (only if not in call)
  const handleClose = () => {
    if (!isInCall) {
      setIsOpen(false)
      setPhoneNumber('')
      setError(null)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105',
          isInCall 
            ? 'bg-green-500 hover:bg-green-600 animate-pulse shadow-green-500/40' 
            : 'bg-primary hover:bg-primary/90'
        )}
        title="Open Dialer"
      >
        {isInCall ? (
          <PhoneCall className="h-6 w-6 text-white" />
        ) : (
          <Phone className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={cn(
            "flex items-center justify-between p-4 border-b transition-colors",
            isInCall ? "bg-green-500/10" : "bg-muted/30"
          )}>
            <div className="flex items-center gap-2">
              {isInCall ? (
                <PhoneCall className="h-4 w-4 text-green-500" />
              ) : (
                <Phone className="h-4 w-4 text-primary" />
              )}
              <span className="font-medium">{isInCall ? 'On Call' : 'Dialer'}</span>
            </div>
            <button
              onClick={handleClose}
              disabled={isInCall}
              className={cn(
                'p-1 rounded hover:bg-muted transition-colors',
                isInCall && 'opacity-50 cursor-not-allowed'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Status */}
            {(error || callStatus !== 'idle') && (
              <p className={cn(
                'text-sm text-center',
                callStatus === 'connected' ? 'text-green-500 font-medium' :
                callStatus === 'ringing' ? 'text-yellow-500' :
                error ? 'text-red-500' :
                'text-muted-foreground'
              )}>
                {error || getStatusText()}
              </p>
            )}

            {/* Phone number input */}
            <div className="relative">
              <input
                ref={inputRef}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+*#]/g, ''))}
                placeholder="Enter phone number"
                className="w-full text-center text-xl font-mono py-3 px-10 bg-muted/50 rounded-lg border-0 focus:ring-2 focus:ring-primary/50 outline-none"
                disabled={isInCall}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && phoneNumber && isDeviceReady && !isInCall) {
                    handleCall()
                  }
                }}
              />
              {phoneNumber && !isInCall && (
                <button
                  onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded transition-colors cursor-pointer"
                >
                  <Delete className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Call controls */}
            <div className="flex justify-center gap-4">
              {isInCall ? (
                <>
                  {/* Mute button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleMute}
                    className={cn(
                      'rounded-full h-14 w-14 shadow-md transition-all',
                      isMuted 
                        ? 'bg-red-500/20 border-red-500 hover:bg-red-500/30' 
                        : 'bg-muted/50 hover:bg-muted'
                    )}
                  >
                    {isMuted ? (
                      <MicOff className="h-6 w-6 text-red-500" />
                    ) : (
                      <Mic className="h-6 w-6" />
                    )}
                  </Button>

                  {/* Hang up button */}
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleHangup}
                    className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                  >
                    <PhoneOff className="h-6 w-6 rotate-[135deg]" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCall}
                  disabled={!phoneNumber || !isDeviceReady || callStatus === 'disconnected'}
                  className="w-full h-14 text-base rounded-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all hover:scale-[1.02]"
                >
                  {!isDeviceReady ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      Call
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Hint */}
            {!isDeviceReady && !error && (
              <p className="text-xs text-center text-muted-foreground">
                Setting up your browser for calls...
              </p>
            )}
            {isDeviceReady && !isInCall && (
              <p className="text-xs text-center text-muted-foreground">
                Type number and press Enter or click Call
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
