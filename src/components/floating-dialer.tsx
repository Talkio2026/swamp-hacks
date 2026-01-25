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
  User,
  Building2,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'connected' | 'disconnected'

interface Contact {
  clientId: string
  clientName: string
  companyName: string
  contactPhone: string
}

export function FloatingDialer() {
  const [isOpen, setIsOpen] = useState(false)
  const [isContactsOpen, setIsContactsOpen] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDeviceReady, setIsDeviceReady] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsLoading, setContactsLoading] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  
  const deviceRef = useRef<Device | null>(null)
  const callRef = useRef<Call | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Fetch contacts when contacts popup opens
  useEffect(() => {
    if (!isContactsOpen) return

    const fetchContacts = async () => {
      setContactsLoading(true)
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          setContacts(data.clients || [])
        }
      } catch (err) {
        console.error('Failed to fetch contacts:', err)
      } finally {
        setContactsLoading(false)
      }
    }

    fetchContacts()
  }, [isContactsOpen])

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact => 
    contact.clientName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.companyName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.contactPhone.includes(contactSearch)
  )

  // Handle contact selection - opens dialer with number and auto-calls
  const handleContactSelect = (contact: Contact) => {
    setPhoneNumber(contact.contactPhone)
    setIsContactsOpen(false)
    setIsOpen(true)
  }

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
      {/* Floating buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Contacts button */}
        <button
          onClick={() => {
            setIsContactsOpen(true)
            setIsOpen(false)
          }}
          className="h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 bg-white border border-gray-200 hover:bg-gray-50"
          title="Contacts"
        >
          <User className="h-5 w-5 text-gray-700" />
        </button>

        {/* Dialer button */}
        <button
          onClick={() => {
            setIsOpen(true)
            setIsContactsOpen(false)
          }}
          className={cn(
            'h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105',
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
      </div>

      {/* Contacts Popup */}
      {isContactsOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 bg-card border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-medium">Contacts</span>
            </div>
            <button
              onClick={() => setIsContactsOpen(false)}
              className="p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 rounded-lg border-0 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="max-h-64 overflow-y-auto">
            {contactsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {contacts.length === 0 ? 'No contacts yet' : 'No matches found'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.clientId}
                    onClick={() => handleContactSelect(contact)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{contact.clientName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{contact.companyName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary font-mono">
                      <Phone className="h-3 w-3" />
                      <span>{contact.contactPhone}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="p-2 border-t bg-muted/20">
            <p className="text-xs text-center text-muted-foreground">
              Click a contact to call
            </p>
          </div>
        </div>
      )}

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
