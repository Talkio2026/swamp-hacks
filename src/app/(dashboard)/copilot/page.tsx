'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Lightbulb,
  AlertTriangle,
  MessageSquare,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Simulated stages for demo
const stages = ['Introduction', 'Discovery', 'Presentation', 'Negotiation', 'Close']

export default function CopilotPage() {
  const [isLive, setIsLive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentStage, setCurrentStage] = useState('Introduction')
  const [suggestions, setSuggestions] = useState<Array<{
    id: string
    text: string
    type: 'prompt' | 'warning' | 'tip'
    timestamp: Date
  }>>([])
  const [manualInput, setManualInput] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)

  // Simulate SSE streaming for demo
  useEffect(() => {
    if (!isLive) return

    const sampleTranscript = [
      { speaker: 'Rep', text: 'Hi, this is Alex from Talkio. Is this Sarah?' },
      { speaker: 'Prospect', text: 'Yes, this is Sarah speaking.' },
      { speaker: 'Rep', text: "Great! Thanks for taking my call. I know you're busy, so I'll be brief." },
      { speaker: 'Prospect', text: "Sure, what's this about?" },
      { speaker: 'Rep', text: "We help sales teams like yours analyze calls automatically. I saw you downloaded our whitepaper last week." },
      { speaker: 'Prospect', text: "Oh yes, we've been looking at solutions in this space." },
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < sampleTranscript.length) {
        const line = sampleTranscript[index]
        setTranscript(prev => prev + `\n[${line.speaker}]: ${line.text}`)
        
        // Simulate AI suggestions
        if (index === 1) {
          setSuggestions(prev => [...prev, {
            id: Date.now().toString(),
            text: "Good opening! Now transition to discovery - ask about their current challenges.",
            type: 'tip',
            timestamp: new Date(),
          }])
          setCurrentStage('Discovery')
        }
        
        if (index === 4) {
          setSuggestions(prev => [...prev, {
            id: Date.now().toString(),
            text: 'Ask: "What specific challenges are you hoping to solve?"',
            type: 'prompt',
            timestamp: new Date(),
          }])
        }
        
        index++
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
    }
  }, [transcript])

  const handleStart = () => {
    setIsLive(true)
    setTranscript('')
    setSuggestions([])
    setCurrentStage('Introduction')
  }

  const handleStop = () => {
    setIsLive(false)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    
    setTranscript(prev => prev + `\n[Manual]: ${manualInput}`)
    setManualInput('')
    
    // Simulate AI response to manual input
    setTimeout(() => {
      setSuggestions(prev => [...prev, {
        id: Date.now().toString(),
        text: 'Noted. Continue with open-ended questions to understand their needs better.',
        type: 'tip',
        timestamp: new Date(),
      }])
    }, 1000)
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Live Copilot" 
        description="AI-powered real-time call assistance"
        actions={
          isLive ? (
            <Button variant="destructive" onClick={handleStop}>
              <Square className="h-4 w-4 mr-2" />
              End Session
            </Button>
          ) : (
            <Button onClick={handleStart}>
              <Play className="h-4 w-4 mr-2" />
              Start Demo
            </Button>
          )
        }
      />
      
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left - Transcript Stream */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Stage indicator */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                    isLive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                  )}>
                    {isLive ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                      </>
                    ) : (
                      <>
                        <MicOff className="h-4 w-4" />
                        Not Active
                      </>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-1">Current Stage</div>
                    <div className="flex gap-1">
                      {stages.map((stage) => (
                        <div
                          key={stage}
                          className={cn(
                            'flex-1 h-2 rounded-full transition-colors',
                            stage === currentStage ? 'bg-primary' :
                            stages.indexOf(stage) < stages.indexOf(currentStage) ? 'bg-primary/40' :
                            'bg-muted'
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-sm font-medium mt-1">{currentStage}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Live transcript */}
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Live Transcript
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                <div 
                  ref={transcriptRef}
                  className="flex-1 bg-muted/30 rounded-lg p-4 font-mono text-sm overflow-y-auto min-h-[300px]"
                >
                  {transcript ? (
                    <pre className="whitespace-pre-wrap">{transcript.trim()}</pre>
                  ) : (
                    <div className="text-muted-foreground text-center py-12">
                      {isLive ? 'Listening...' : 'Click "Start Demo" to begin a simulated call'}
                    </div>
                  )}
                </div>
                
                {/* Manual input */}
                <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
                  <Textarea
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste transcript snippet or type notes..."
                    className="min-h-[60px] resize-none"
                    disabled={!isLive}
                  />
                  <Button type="submit" disabled={!isLive || !manualInput.trim()}>
                    <Zap className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          {/* Right - AI Suggestions */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1 flex flex-col min-h-0">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {suggestions.length > 0 ? (
                  <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className={cn(
                          'p-3 rounded-lg border-l-4 animate-in slide-in-from-right',
                          suggestion.type === 'prompt' && 'bg-blue-50 border-blue-400',
                          suggestion.type === 'warning' && 'bg-yellow-50 border-yellow-400',
                          suggestion.type === 'tip' && 'bg-green-50 border-green-400'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {suggestion.type === 'prompt' && <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5" />}
                          {suggestion.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />}
                          {suggestion.type === 'tip' && <Lightbulb className="h-4 w-4 text-green-500 mt-0.5" />}
                          <p className="text-sm flex-1">{suggestion.text}</p>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          {suggestion.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>AI suggestions will appear here during the call</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">Prompt</Badge>
                    <span className="text-muted-foreground">Suggested question</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-50">Warning</Badge>
                    <span className="text-muted-foreground">Objection detected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-50">Tip</Badge>
                    <span className="text-muted-foreground">Coaching insight</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
