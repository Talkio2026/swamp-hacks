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
  Send,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRAINING_SCENARIOS, TrainingScenario } from '@/lib/training/scenarios'

type SessionState = 'selecting' | 'active' | 'evaluating' | 'results'

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

// Check if browser supports speech recognition
const SpeechRecognition = typeof window !== 'undefined' 
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null

export default function TrainingPage() {
  const [sessionState, setSessionState] = useState<SessionState>('selecting')
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null)
  const [conversation, setConversation] = useState<ConversationTurn[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  
  const conversationRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Auto-scroll conversation
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight
    }
  }, [conversation])

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onresult = (event) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
          } else {
            interim += transcript
          }
        }

        setInterimTranscript(interim)

        if (final) {
          handleUserInput(final.trim())
          setInterimTranscript('')
        }
      }

      recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          setError(`Speech recognition error: ${event.error}`)
        }
      }

      recognition.onend = () => {
        // Restart if still in active session and listening
        if (sessionState === 'active' && isListening) {
          try {
            recognition.start()
          } catch (e) {
            // Recognition restart failed, will retry on next user interaction
          }
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [sessionState, isListening])

  // Play TTS audio
  const playTTS = useCallback(async (text: string, voiceId?: string) => {
    if (!ttsEnabled || isMuted) return

    try {
      setIsSpeaking(true)
      
      const response = await fetch('/api/training/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to generate speech')
        setError(`TTS Error: ${errorText}`)
        setIsSpeaking(false)
        return
      }

      const data = await response.json()
      
      if (data.audio) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`)
        audioRef.current = audio
        
        audio.onended = () => {
          setIsSpeaking(false)
        }
        
        audio.onerror = () => {
          setError('Failed to play audio. Please check your audio settings.')
          setIsSpeaking(false)
        }
        
        await audio.play()
      }
    } catch (err) {
      setError(err instanceof Error ? `TTS Error: ${err.message}` : 'Failed to generate speech')
      setIsSpeaking(false)
    }
  }, [ttsEnabled, isMuted])

  // Handle user input (from speech or text)
  const handleUserInput = useCallback(async (input: string) => {
    if (!input.trim() || isProcessing || !selectedScenario) return

    setIsProcessing(true)

    // Add user message
    const userTurn: ConversationTurn = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    }
    
    setConversation(prev => [...prev, userTurn])

    try {
      // Get AI response
      const response = await fetch('/api/training/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          conversation: [...conversation, userTurn],
        }),
      })

      const data = await response.json()
      
      if (data.response) {
        // Add AI response
        setConversation(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        }])

        // Speak the response using ElevenLabs TTS
        await playTTS(data.response, selectedScenario.voiceId)
      }
    } catch (err) {
      setError(err instanceof Error ? `Failed to get AI response: ${err.message}` : 'Failed to get AI response. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [isProcessing, selectedScenario, conversation, playTTS])

  // Start session - can accept a scenario directly for instant start
  const startSession = useCallback(async (scenario?: TrainingScenario) => {
    const activeScenario = scenario || selectedScenario
    if (!activeScenario) return

    // Set the scenario if passed directly
    if (scenario) {
      setSelectedScenario(scenario)
    }

    setSessionState('active')
    setConversation([])
    setSessionStartTime(Date.now())
    setError(null)

    // Add the prospect's first message
    const firstMessage = getFirstMessage(activeScenario)
    setConversation([{
      role: 'assistant',
      content: firstMessage,
      timestamp: Date.now(),
    }])

    // Speak the first message
    await playTTS(firstMessage, activeScenario.voiceId)
  }, [selectedScenario, playTTS])

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in your browser. Please use Chrome.')
      return
    }

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setInterimTranscript('')
    } else {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (e) {
        setError('Could not start microphone. Please check permissions.')
      }
    }
  }

  // Handle text submit
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim() || isProcessing) return
    
    handleUserInput(textInput.trim())
    setTextInput('')
  }

  // End session
  const endSession = async () => {
    // Stop listening
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
    }

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
      setError(err instanceof Error ? `Failed to generate evaluation: ${err.message}` : 'Failed to generate evaluation. Please try again.')
      setSessionState('active')
    }
  }

  // Reset session
  const resetSession = () => {
    setSessionState('selecting')
    setSelectedScenario(null)
    setConversation([])
    setEvaluation(null)
    setError(null)
    setInterimTranscript('')
  }

  return (
    <div className="flex flex-col h-full">
      <Header 
        title="Sales Training"
        actions={
          sessionState === 'active' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetSession}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button variant="destructive" onClick={endSession}>
                <PhoneOff className="h-4 w-4 mr-2" />
                End & Analyze
              </Button>
            </div>
          ) : sessionState === 'results' ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={resetSession}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Button>
              <Button onClick={resetSession}>
                <RotateCcw className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
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
                Practice with AI-powered prospects. You speak, they respond with realistic voice.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TRAINING_SCENARIOS.map((scenario, index) => (
                <Card 
                  key={scenario.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary hover:scale-[1.02] opacity-0 translate-y-4"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s forwards`
                  }}
                  onClick={() => startSession(scenario)}
                >
                  <CardHeader className="relative overflow-hidden bg-violet-50 border-b border-white/50">
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-medium",
                          scenario.difficulty === 'beginner' && 'bg-green-100 text-green-700 border border-green-200',
                          scenario.difficulty === 'intermediate' && 'bg-yellow-100 text-yellow-700 border border-yellow-200',
                          scenario.difficulty === 'advanced' && 'bg-red-100 text-red-700 border border-red-200'
                        )}>
                          {scenario.difficulty}
                        </span>
                        <span className={cn(
                          "inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-medium border",
                          scenario.category === 'cold-call' && 'bg-blue-100 text-blue-700 border-blue-200',
                          scenario.category === 'discovery' && 'bg-purple-100 text-purple-700 border-purple-200',
                          scenario.category === 'objection-handling' && 'bg-orange-100 text-orange-700 border-orange-200',
                          scenario.category === 'closing' && 'bg-pink-100 text-pink-700 border-pink-200',
                          scenario.category === 'demo' && 'bg-cyan-100 text-cyan-700 border-cyan-200'
                        )}>
                          {scenario.category.replace('-', ' ')}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
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

          </div>
        )}

        {/* Active Session */}
        {sessionState === 'active' && selectedScenario && (
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid lg:grid-cols-3 gap-4 h-[calc(100vh-10rem)]">
              {/* Conversation Panel */}
              <div className="lg:col-span-2 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0s_forwards]">
                <Card className="h-full flex flex-col">
                  <CardHeader className="bg-violet-50 flex-shrink-0 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Call with {selectedScenario.persona.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {selectedScenario.persona.title} at {selectedScenario.persona.company}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                          title={isMuted ? 'Unmute AI voice' : 'Mute AI voice'}
                          className="px-2 h-8"
                        >
                          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </Button>
                        {isSpeaking && (
                          <Badge variant="secondary" className="animate-pulse text-xs">
                            <Volume2 className="h-3 w-3 mr-1" />
                            Speaking...
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0 p-4 pt-0">
                    {/* Conversation */}
                    <div 
                      ref={conversationRef}
                      className="flex-1 overflow-y-auto space-y-3 mb-3 pt-3"
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
                              'max-w-[80%] rounded-lg px-3 py-1.5',
                              turn.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            )}
                          >
                            <p className="text-xs font-medium mb-0.5">
                              {turn.role === 'user' ? 'You (Sales Rep)' : selectedScenario.persona.name}
                            </p>
                            <p className="text-sm">{turn.content}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Interim transcript (what you're saying) */}
                      {interimTranscript && (
                        <div className="flex justify-end">
                          <div className="max-w-[80%] rounded-lg px-3 py-1.5 bg-primary/50 text-primary-foreground italic">
                            <p className="text-xs">{interimTranscript}...</p>
                          </div>
                        </div>
                      )}
                      
                      {isProcessing && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg px-3 py-1.5 flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="text-xs">Thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Input Controls */}
                    <div className="space-y-2">
                      {/* Microphone Button */}
                      <div className="flex justify-center">
                        <Button
                          size="lg"
                          variant={isListening ? 'destructive' : 'default'}
                          onClick={toggleMicrophone}
                          disabled={isProcessing || isSpeaking}
                          className="rounded-full h-12 w-12"
                        >
                          {isListening ? (
                            <MicOff className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">
                        {isListening ? 'Listening... Click to stop' : 'Click to speak'}
                      </p>

                      {/* Text Input (fallback) */}
                      <form onSubmit={handleTextSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          placeholder="Or type your response..."
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          disabled={isProcessing || isSpeaking}
                        />
                        <Button type="submit" size="sm" disabled={isProcessing || !textInput.trim() || isSpeaking}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Scenario Info Panel */}
              <div className="h-full flex flex-col gap-3">
                <Card className="flex-1 flex flex-col min-h-0 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                  <CardHeader className="bg-violet-50 px-4 py-3 flex-shrink-0">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Your Objectives
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 flex-1 overflow-hidden">
                    <ul className="space-y-2 h-full flex flex-col justify-center">
                      {selectedScenario.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium">
                            {i + 1}
                          </div>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col min-h-0 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.15s_forwards]">
                  <CardHeader className="bg-violet-50 px-4 py-3 flex-shrink-0">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 flex-1 overflow-hidden">
                    <ul className="space-y-2 text-sm text-muted-foreground h-full flex flex-col justify-center">
                      <li>• Listen more than you talk</li>
                      <li>• Ask open-ended questions</li>
                      <li>• Address objections, don&apos;t ignore them</li>
                      <li>• Always have a clear next step</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="flex-1 flex flex-col min-h-0 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards]">
                  <CardHeader className="bg-violet-50 px-4 py-3 flex-shrink-0">
                    <CardTitle className="text-sm">Prospect Context</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 py-3 flex-1 overflow-hidden text-sm space-y-2 flex flex-col justify-center">
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
            <Card className="mb-6 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0s_forwards]">
              <CardHeader className="bg-violet-50 pb-0">
                <CardTitle className="sr-only">Training Complete</CardTitle>
              </CardHeader>
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
              <Card className="opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards]">
                <CardHeader className="bg-violet-50">
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
              <Card className="opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.15s_forwards]">
                <CardHeader className="bg-violet-50">
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
              <Card className="opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards]">
                <CardHeader className="bg-violet-50">
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
              <Card className="opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.25s_forwards]">
                <CardHeader className="bg-violet-50">
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
            {evaluation.keyMoments && evaluation.keyMoments.length > 0 && (
              <Card className="mt-6 opacity-0 translate-y-4 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards]">
                <CardHeader className="bg-violet-50">
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

// Helper function for first message
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

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
