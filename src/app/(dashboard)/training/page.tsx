'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  Target,
  Trophy,
  MessageSquare,
  Volume2,
  VolumeX,
  Loader2,
  ChevronRight,
  RotateCcw,
  Star,
  Clock,
  Zap,
  GraduationCap,
  Phone,
  PhoneOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRAINING_SCENARIOS, TrainingScenario } from '@/lib/training/scenarios'

type SessionState = 'selecting' | 'preparing' | 'active' | 'evaluating' | 'results'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface EvaluationResult {
  overallScore: number
  grade: string
  objectivesAchieved: { objective: string; achieved: boolean; notes: string }[]
  criteriaScores: { criterion: string; score: number; feedback: string }[]
  strengths: string[]
  areasForImprovement: string[]
  keyMoments: { type: string; description: string; suggestion: string }[]
  specificFeedback: {
    opening: string
    questioningSkills: string
    listening: string
    objectionHandling: string
    closing: string
  }
  coachingTips: string[]
  recommendedPractice: string
}

export default function TrainingPage() {
  const [sessionState, setSessionState] = useState<SessionState>('selecting')
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [agentId, setAgentId] = useState<string | null>(null)
  const [mode, setMode] = useState<'voice' | 'text' | 'mock'>('mock')
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const conversationRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversation])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const handleSelectScenario = async (scenario: TrainingScenario) => {
    setSelectedScenario(scenario)
    setSessionState('preparing')
    setError(null)

    try {
      // Create/get the training agent
      const response = await fetch('/api/training/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to prepare training session')
      }

      setMode(data.mode)
      if (data.agentId) {
        setAgentId(data.agentId)
      }

      // Ready to start
      setSessionState('selecting')
    } catch (err) {
      console.error('Error preparing session:', err)
      setError(err instanceof Error ? err.message : 'Failed to prepare session')
      setMode('text') // Fallback to text mode
    }
  }

  const startSession = useCallback(async () => {
    if (!selectedScenario) return

    setSessionState('active')
    setConversation([])
    setSessionStartTime(Date.now())
    setError(null)

    if (mode === 'voice' && agentId) {
      // Connect to ElevenLabs WebSocket
      try {
        const urlResponse = await fetch('/api/training/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId }),
        })

        const { signedUrl } = await urlResponse.json()

        if (signedUrl) {
          wsRef.current = new WebSocket(signedUrl)
          
          wsRef.current.onopen = () => {
            console.log('[Training] WebSocket connected')
            setIsListening(true)
            startRecording()
          }

          wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            handleWebSocketMessage(data)
          }

          wsRef.current.onerror = (error) => {
            console.error('[Training] WebSocket error:', error)
            setError('Voice connection failed. Switching to text mode.')
            setMode('text')
          }

          wsRef.current.onclose = () => {
            console.log('[Training] WebSocket closed')
            setIsListening(false)
          }
        }
      } catch (err) {
        console.error('[Training] Failed to connect voice:', err)
        setMode('text')
      }
    } else {
      // Text or mock mode - add the AI's first message
      const firstMessage = getFirstMessage(selectedScenario)
      setConversation([{
        role: 'assistant',
        content: firstMessage,
        timestamp: Date.now(),
      }])
    }
  }, [selectedScenario, mode, agentId])

  const handleWebSocketMessage = (data: Record<string, unknown>) => {
    switch (data.type) {
      case 'user_transcript':
        // User's speech was transcribed
        if (data.text) {
          setConversation(prev => [...prev, {
            role: 'user',
            content: data.text as string,
            timestamp: Date.now(),
          }])
        }
        break
      case 'agent_response':
        // Agent's text response
        if (data.text) {
          setConversation(prev => [...prev, {
            role: 'assistant',
            content: data.text as string,
            timestamp: Date.now(),
          }])
        }
        break
      case 'audio':
        // Play audio response
        if (!isMuted && data.audio) {
          playAudio(data.audio as string)
        }
        break
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext({ sampleRate: 16000 })
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
          const arrayBuffer = await event.data.arrayBuffer()
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
          wsRef.current.send(JSON.stringify({
            type: 'audio',
            audio: base64,
          }))
        }
      }

      mediaRecorder.start(100) // Send audio every 100ms
    } catch (err) {
      console.error('[Training] Failed to start recording:', err)
      setError('Microphone access denied. Please allow microphone access and try again.')
    }
  }

  const playAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`)
    audio.play()
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim() || isProcessing) return

    const userMessage = textInput.trim()
    setTextInput('')
    setIsProcessing(true)

    // Add user message
    setConversation(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }])

    try {
      // In mock/text mode, use our AI to generate response
      const response = await fetch('/api/training/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario?.id,
          conversation: [...conversation, { role: 'user', content: userMessage }],
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        }])
      }
    } catch (err) {
      console.error('[Training] Response error:', err)
      // Fallback to simple mock response
      setTimeout(() => {
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: getMockResponse(userMessage, selectedScenario),
          timestamp: Date.now(),
        }])
      }, 1000)
    } finally {
      setIsProcessing(false)
    }
  }

  const endSession = async () => {
    // Stop voice session if active
    if (wsRef.current) {
      wsRef.current.close()
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
    }

    setIsListening(false)
    setSessionState('evaluating')

    // Get evaluation
    try {
      const duration = sessionStartTime ? (Date.now() - sessionStartTime) / 1000 : 0
      
      const response = await fetch('/api/training/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario?.id,
          conversation,
          duration,
        }),
      })

      const data = await response.json()

      if (data.evaluation) {
        setEvaluation(data.evaluation)
        setSessionState('results')
      } else {
        throw new Error('No evaluation returned')
      }
    } catch (err) {
      console.error('[Training] Evaluation error:', err)
      setError('Failed to generate evaluation. Please try again.')
      setSessionState('active')
    }
  }

  const resetSession = () => {
    setSessionState('selecting')
    setSelectedScenario(null)
    setConversation([])
    setEvaluation(null)
    setError(null)
    setAgentId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Sales Training" 
        description="Practice your sales skills with AI-powered role-play"
        actions={
          sessionState === 'active' ? (
            <Button variant="destructive" onClick={endSession}>
              <PhoneOff className="h-4 w-4 mr-2" />
              End Session
            </Button>
          ) : sessionState === 'results' ? (
            <Button onClick={resetSession}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Session
            </Button>
          ) : null
        }
      />

      <div className="flex-1 p-6 overflow-auto">
        {/* Scenario Selection */}
        {sessionState === 'selecting' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">Choose a Training Scenario</h2>
              <p className="text-muted-foreground">
                Practice with AI-powered prospects in realistic sales situations
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRAINING_SCENARIOS.map((scenario) => (
                <Card 
                  key={scenario.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-lg hover:border-primary',
                    selectedScenario?.id === scenario.id && 'border-primary ring-2 ring-primary/20'
                  )}
                  onClick={() => handleSelectScenario(scenario)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        scenario.difficulty === 'beginner' ? 'default' :
                        scenario.difficulty === 'intermediate' ? 'secondary' :
                        'destructive'
                      }>
                        {scenario.difficulty}
                      </Badge>
                      <Badge variant="outline">{scenario.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {scenario.objectives.length} objectives
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          ~{scenario.estimatedDuration} min
                        </span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Prospect:</p>
                        <p className="text-sm text-muted-foreground">
                          {scenario.persona.name}, {scenario.persona.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {scenario.persona.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedScenario && (
              <div className="mt-8 flex justify-center">
                <Button size="lg" onClick={startSession} className="gap-2">
                  <Phone className="h-5 w-5" />
                  Start Training Call
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Active Session */}
        {sessionState === 'active' && selectedScenario && (
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Conversation Panel */}
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          Conversation
                        </CardTitle>
                        <CardDescription>
                          {selectedScenario.persona.name} - {selectedScenario.persona.title}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {mode === 'voice' && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setIsMuted(!isMuted)}
                            >
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <div className={cn(
                              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                              isListening ? 'bg-green-100 text-green-700' : 'bg-muted'
                            )}>
                              {isListening ? (
                                <>
                                  <Mic className="h-4 w-4" />
                                  Listening...
                                </>
                              ) : (
                                <>
                                  <MicOff className="h-4 w-4" />
                                  Mic Off
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
                    <div 
                      ref={conversationRef}
                      className="flex-1 overflow-y-auto space-y-4 mb-4"
                    >
                      {conversation.map((turn, i) => (
                        <div
                          key={i}
                          className={cn(
                            'flex',
                            turn.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[80%] rounded-lg px-4 py-2',
                              turn.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-sm font-medium mb-1">
                              {turn.role === 'user' ? 'You' : selectedScenario.persona.name}
                            </p>
                            <p>{turn.content}</p>
                          </div>
                        </div>
                      ))}
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-4 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Text Input (for text/mock mode) */}
                    {(mode === 'text' || mode === 'mock') && (
                      <form onSubmit={handleTextSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Type your response..."
                          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isProcessing}
                        />
                        <Button type="submit" disabled={isProcessing || !textInput.trim()}>
                          <Zap className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Scenario Info Panel */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Your Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {selectedScenario.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Listen more than you talk</li>
                      <li>• Ask open-ended questions</li>
                      <li>• Address objections, don&apos;t ignore them</li>
                      <li>• Always have a clear next step</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Prospect Context</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Industry:</strong> {selectedScenario.persona.industry}</p>
                    <p><strong>Company:</strong> {selectedScenario.persona.company}</p>
                    <p><strong>Style:</strong> {selectedScenario.persona.decisionMakingStyle}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Evaluating */}
        {sessionState === 'evaluating' && (
          <div className="max-w-md mx-auto text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Performance</h2>
            <p className="text-muted-foreground">
              Our AI coach is reviewing your conversation...
            </p>
          </div>
        )}

        {/* Results */}
        {sessionState === 'results' && evaluation && selectedScenario && (
          <div className="max-w-4xl mx-auto">
            {/* Score Header */}
            <Card className="mb-6">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Training Complete!</h2>
                    <p className="text-muted-foreground">
                      {selectedScenario.name} with {selectedScenario.persona.name}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-6xl font-bold',
                      evaluation.overallScore >= 80 ? 'text-green-500' :
                      evaluation.overallScore >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    )}>
                      {evaluation.overallScore}
                    </div>
                    <div className="text-2xl font-semibold text-muted-foreground">
                      Grade: {evaluation.grade}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Objectives */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objectives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {evaluation.objectivesAchieved.map((obj, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                          obj.achieved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        )}>
                          {obj.achieved ? '✓' : '✗'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{obj.objective}</p>
                          <p className="text-sm text-muted-foreground">{obj.notes}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Strengths & Improvements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Strengths & Improvements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
                        <Star className="h-4 w-4" /> What You Did Well
                      </h4>
                      <ul className="space-y-1">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-600 mb-2">Areas to Improve</h4>
                      <ul className="space-y-1">
                        {evaluation.areasForImprovement.map((a, i) => (
                          <li key={i} className="text-sm text-muted-foreground">• {a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Criteria Scores */}
              <Card>
                <CardHeader>
                  <CardTitle>Skill Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evaluation.criteriaScores.map((criteria, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{criteria.criterion}</span>
                          <span>{criteria.score}/100</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              'h-full rounded-full transition-all',
                              criteria.score >= 80 ? 'bg-green-500' :
                              criteria.score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            )}
                            style={{ width: `${criteria.score}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{criteria.feedback}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Coaching Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Coaching Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {evaluation.coachingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                    <p className="text-sm font-medium">Recommended Practice:</p>
                    <p className="text-sm text-muted-foreground">{evaluation.recommendedPractice}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Key Moments */}
            {evaluation.keyMoments.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Key Moments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evaluation.keyMoments.map((moment, i) => (
                      <div 
                        key={i}
                        className={cn(
                          'p-3 rounded-lg border-l-4',
                          moment.type === 'positive' && 'bg-green-50 border-green-400',
                          moment.type === 'negative' && 'bg-red-50 border-red-400',
                          moment.type === 'missed_opportunity' && 'bg-yellow-50 border-yellow-400'
                        )}
                      >
                        <p className="text-sm font-medium">{moment.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">{moment.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="mt-8 flex justify-center gap-4">
              <Button variant="outline" onClick={resetSession}>
                Try Another Scenario
              </Button>
              <Button onClick={() => {
                setConversation([])
                setEvaluation(null)
                startSession()
              }}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry This Scenario
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function getFirstMessage(scenario: TrainingScenario): string {
  switch (scenario.category) {
    case 'cold-call':
      return `Hello? Who is this?`
    case 'discovery':
      return `Hi, thanks for jumping on the call. I have about 30 minutes. What would you like to cover today?`
    case 'objection-handling':
      return `Hey! Good to connect again. So, I've been thinking about what you showed me... I have some concerns about the pricing we need to discuss.`
    case 'closing':
      return `Hi there. So... I think we're at decision time. I've been thinking a lot about this.`
    case 'demo':
      return `Thanks for setting this up. I've seen a couple other demos already, so I know what I'm looking for. Let's dive in.`
    default:
      return `Hello, thanks for calling.`
  }
}

function getMockResponse(userMessage: string, scenario: TrainingScenario | null): string {
  if (!scenario) return "I'm not sure what you mean."
  
  // Simple mock responses based on scenario type
  const responses = [
    "That's interesting. Tell me more about that.",
    "Hmm, I see. But what about the price?",
    "We've heard that before from other vendors.",
    "How would that actually work for our team?",
    "I need to think about that one.",
    "Can you give me a specific example?",
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}
