'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Device, Call } from '@twilio/voice-sdk'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'motion/react'
import {
  Phone,
  PhoneOff,
  PhoneCall,
  Mic,
  MicOff,
  X,
  Loader2,
  Delete,
  Users,
  Building2,
  Search,
  Sparkles,
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
  const [isMenuExpanded, setIsMenuExpanded] = useState(false)
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

        device.on('error', (err: any) => {
          console.error('Twilio Device error:', err)
          const errorCode = err.code || err.message?.match(/\((\d+)\)/)?.[1]
          
          // Handle specific error codes - 31005 is a connection error during hangup (usually not critical)
          if (errorCode === '31005') {
            console.log('Device connection error during hangup (normal)')
            return // Don't show this as an error
          }
          
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
        setTimeout(() => {
          setCallStatus('idle')
          setError(null) // Clear any previous errors
        }, 2000)
      })

      call.on('error', (err: any) => {
        console.error('Call error:', err)
        // Handle specific Twilio error codes
        const errorCode = err.code || err.message?.match(/\((\d+)\)/)?.[1]
        let errorMessage = 'Call failed'
        
        if (errorCode === '31005' || err.message?.includes('31005')) {
          // ConnectionError from gateway during HANGUP - usually means call was disconnected
          errorMessage = 'Call disconnected by gateway'
          // Don't show this as an error since it's a normal disconnect scenario
          setError(null)
        } else if (errorCode === '31000' || err.message?.includes('31000')) {
          errorMessage = 'Connection timeout'
        } else if (errorCode === '31008' || err.message?.includes('31008')) {
          errorMessage = 'Connection lost'
        } else {
          errorMessage = err.message || 'Call failed'
        }
        
        // Only set error for non-hangup errors
        if (errorCode !== '31005') {
          setError(errorMessage)
        }
        
        setCallStatus('disconnected')
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        setTimeout(() => setCallStatus('idle'), 2000)
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

  // Close all popups
  const closeAll = () => {
    if (!isInCall) {
      setIsOpen(false)
      setIsContactsOpen(false)
      setIsMenuExpanded(false)
    }
  }

  return (
    <>
      {/* Backdrop - closes popups when clicking outside */}
      <AnimatePresence>
        {(isOpen || isContactsOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
            onClick={closeAll}
          />
        )}
      </AnimatePresence>

      {/* Floating buttons - hidden along right edge */}
      <div 
        className="fixed right-0 bottom-24 z-50 flex flex-col items-end gap-4 pr-0"
        onMouseEnter={() => setIsMenuExpanded(true)}
        onMouseLeave={() => {
          if (!isOpen && !isContactsOpen) {
            setIsMenuExpanded(false)
          }
        }}
      >
        {/* Contacts button */}
        <motion.button
          onClick={() => {
            setIsContactsOpen(!isContactsOpen)
            setIsOpen(false)
          }}
          className={cn(
            "h-12 w-12 rounded-l-2xl shadow-xl flex items-center justify-center",
            "bg-gradient-to-br from-violet-500 to-indigo-600",
            "border border-white/20 border-r-0"
          )}
          initial={{ x: 36 }}
          animate={
            isMenuExpanded || isContactsOpen
              ? { x: 0 }
              : { x: 36 }
          }
          transition={{ type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
          title="Contacts"
        >
          <Users className="h-5 w-5 text-white" />
        </motion.button>

        {/* Dialer button */}
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen)
            setIsContactsOpen(false)
          }}
          className={cn(
            'h-14 w-14 rounded-l-2xl shadow-xl flex items-center justify-center',
            'border border-white/20 border-r-0',
            isInCall 
              ? 'bg-gradient-to-br from-emerald-400 to-green-600 shadow-green-500/40' 
              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
          )}
          initial={{ x: 42 }}
          animate={
            isMenuExpanded || isOpen || isInCall
              ? { x: 0 }
              : { x: 42 }
          }
          transition={{ type: "tween", ease: [0.25, 0.1, 0.25, 1], duration: 0.3 }}
          title="Open Dialer"
        >
          {isInCall ? (
            <PhoneCall className="h-6 w-6 text-white" />
          ) : (
            <Phone className="h-6 w-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* Contacts Popup */}
      <AnimatePresence>
        {isContactsOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-[11.5rem] right-16 z-50 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-indigo-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Contacts</span>
              </div>
              <motion.button
                onClick={() => setIsContactsOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 text-gray-500" />
              </motion.button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="search"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-violet-500/30 focus:bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="max-h-64 overflow-y-auto">
              {contactsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <Loader2 className="h-6 w-6 text-violet-500" />
                  </motion.div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {contacts.length === 0 ? 'No contacts yet' : 'No matches found'}
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  {filteredContacts.map((contact, index) => (
                    <motion.button
                      key={contact.clientId}
                      onClick={() => handleContactSelect(contact)}
                      className="w-full px-3 py-3 flex items-center gap-3 hover:bg-violet-50 rounded-xl transition-colors text-left group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:from-violet-200 group-hover:to-indigo-200 transition-colors">
                        <span className="text-sm font-semibold text-violet-600">
                          {contact.clientName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-800 truncate">{contact.clientName}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{contact.companyName}</span>
                        </div>
                      </div>
                      <motion.div 
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Phone className="h-3 w-3 text-green-600" />
                        <span className="text-xs font-medium text-green-700">{contact.contactPhone.slice(-4)}</span>
                      </motion.div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-center text-gray-400">
              Select a contact to begin outreach
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialer Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-[4.5rem] z-50 w-80 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-4 border-b transition-colors",
              isInCall 
                ? "bg-gradient-to-r from-emerald-50 to-green-50 border-green-100" 
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-gray-100"
            )}>
              <div className="flex items-center gap-2">
                <motion.div 
                  className={cn(
                    "h-8 w-8 rounded-xl flex items-center justify-center",
                    isInCall 
                      ? "bg-gradient-to-br from-emerald-400 to-green-600" 
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
                  )}
                  animate={isInCall ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {isInCall ? (
                    <PhoneCall className="h-4 w-4 text-white" />
                  ) : (
                    <Phone className="h-4 w-4 text-white" />
                  )}
                </motion.div>
                <span className="font-semibold text-gray-800">{isInCall ? 'On Call' : 'Dialer'}</span>
              </div>
              <motion.button
                onClick={handleClose}
                disabled={isInCall}
                className={cn(
                  'p-2 rounded-xl transition-colors',
                  isInCall ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                )}
                whileHover={!isInCall ? { scale: 1.1 } : {}}
                whileTap={!isInCall ? { scale: 0.9 } : {}}
              >
                <X className="h-4 w-4 text-gray-500" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-5">
              {/* Status */}
              <AnimatePresence mode="wait">
                {(error || callStatus !== 'idle') && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'text-sm text-center font-medium py-2 px-4 rounded-xl',
                      callStatus === 'connected' ? 'text-green-600 bg-green-50' :
                      callStatus === 'ringing' ? 'text-amber-600 bg-amber-50' :
                      error ? 'text-red-600 bg-red-50' :
                      'text-gray-500 bg-gray-50'
                    )}
                  >
                    {error || getStatusText()}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Phone number input */}
              <div className="relative">
                <input
                  ref={inputRef}
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+*#]/g, ''))}
                  placeholder="Enter phone number"
                  className="w-full text-center text-sm font-mono py-4 px-12 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-blue-500/30 focus:bg-white outline-none transition-all"
                  disabled={isInCall}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && phoneNumber && isDeviceReady && !isInCall) {
                      handleCall()
                    }
                  }}
                />
                <AnimatePresence>
                  {phoneNumber && !isInCall && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setPhoneNumber(prev => prev.slice(0, -1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-xl transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Delete className="h-5 w-5 text-gray-400" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Call controls */}
              <div className="flex justify-center gap-4">
                {isInCall ? (
                  <>
                    {/* Mute button */}
                    <motion.button
                      onClick={handleToggleMute}
                      className={cn(
                        'rounded-2xl h-16 w-16 shadow-lg flex items-center justify-center border-2',
                        isMuted 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-gray-50 border-gray-200'
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isMuted ? (
                        <MicOff className="h-7 w-7 text-red-500" />
                      ) : (
                        <Mic className="h-7 w-7 text-gray-600" />
                      )}
                    </motion.button>

                    {/* Hang up button */}
                    <motion.button
                      onClick={handleHangup}
                      className="rounded-2xl h-16 w-16 bg-gradient-to-br from-red-500 to-rose-600 shadow-xl shadow-red-500/30 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PhoneOff className="h-7 w-7 text-white rotate-[135deg]" />
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={handleCall}
                    disabled={!phoneNumber || !isDeviceReady || callStatus === 'disconnected'}
                    className={cn(
                      "w-full h-14 text-base rounded-2xl shadow-xl flex items-center justify-center gap-2 font-semibold text-white",
                      (!phoneNumber || !isDeviceReady) 
                        ? "bg-gray-300 cursor-not-allowed" 
                        : "bg-gradient-to-r from-emerald-500 to-green-600 shadow-green-500/30"
                    )}
                    whileHover={phoneNumber && isDeviceReady ? { scale: 1.02 } : {}}
                    whileTap={phoneNumber && isDeviceReady ? { scale: 0.98 } : {}}
                  >
                    {!isDeviceReady ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Phone className="h-5 w-5" />
                        Call
                      </>
                    )}
                  </motion.button>
                )}
              </div>

              {/* Hint */}
              <AnimatePresence mode="wait">
                {!isDeviceReady && !error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-center text-gray-400"
                  >
                    Setting up your browser for calls...
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
