'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Loader2,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  ShieldAlert,
  Calendar,
  X,
  Check,
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'

// Calendar event creation API
async function createCalendarEvent(params: {
  clientName: string
  meetingType: 'call' | 'demo' | 'meeting'
  date: string
  time: string
  duration: number
  description?: string
}): Promise<{ success: boolean; event?: { htmlLink: string }; error?: string; needsAuth?: boolean }> {
  const res = await fetch('/api/calendar/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return res.json()
}

// Helper function to parse structured insight content
function parseInsightContent(content: string): { title: string; sections: { label: string; text: string }[] } {
  // Extract title from brackets [Title]
  const titleMatch = content.match(/^\[([^\]]+)\]/)
  const title = titleMatch ? titleMatch[1] : ''
  const restContent = titleMatch ? content.slice(titleMatch[0].length).trim() : content
  
  // Parse sections (WHAT HAPPENED:, WHY IT MATTERS:, ACTION 1:, etc.)
  const sections: { label: string; text: string }[] = []
  const sectionPattern = /(WHAT HAPPENED|WHY IT MATTERS|ACTION \d+|PRIORITY|TIMING|WHAT TO DO|PREPARATION|SUCCESS CRITERIA):\s*/gi
  
  const parts = restContent.split(sectionPattern).filter(Boolean)
  
  for (let i = 0; i < parts.length; i += 2) {
    if (parts[i + 1]) {
      sections.push({
        label: parts[i].trim(),
        text: parts[i + 1].trim()
      })
    }
  }
  
  // If no sections found, treat the whole content as a single section
  if (sections.length === 0 && restContent) {
    sections.push({ label: '', text: restContent })
  }
  
  return { title, sections }
}

// Insight Section Component - Enterprise-friendly minimal design
function InsightSection({ 
  icon, 
  title, 
  color, 
  items, 
  emptyMessage,
  emptyIsPositive = false 
}: { 
  icon: React.ReactNode | null
  title: string
  color: 'blue' | 'emerald' | 'amber' | 'red'
  items: string[]
  emptyMessage: string
  emptyIsPositive?: boolean
}) {
  // Subtle accent color - only for the left border indicator
  const borderColors = {
    blue: 'border-l-slate-400',
    emerald: 'border-l-slate-400',
    amber: 'border-l-slate-400',
    red: 'border-l-slate-400',
  }
  
  // Icon colors - subtle but distinct
  const iconColors = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  }
  
  return (
    <div>
      {/* Section Header - Clean, enterprise-style */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b">
        <div className="flex items-center gap-2">
          {icon && <span className={cn("flex-shrink-0", iconColors[color])}>{icon}</span>}
          <h4 className="font-medium text-sm text-foreground uppercase tracking-wide">{title}</h4>
        </div>
        <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''}</span>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item, i) => {
            const parsed = parseInsightContent(item)
            
            return (
              <div key={i} className={cn("pl-3 border-l-2", borderColors[color])}>
                {/* Item Title */}
                {parsed.title && (
                  <div className="font-medium text-sm text-foreground mb-1.5">
                    {parsed.title}
                  </div>
                )}
                
                {/* Structured Content */}
                {parsed.sections.length > 0 ? (
                  <div className="space-y-1.5">
                    {parsed.sections.map((section, j) => (
                      <div key={j} className="text-sm leading-relaxed">
                        {section.label && (
                          <span className="font-medium text-foreground/70 text-xs mr-1.5">
                            {section.label}:
                          </span>
                        )}
                        <span className="text-black">{section.text}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-black leading-relaxed">{item}</p>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground/70 italic">
          {emptyMessage}
        </p>
      )}
    </div>
  )
}

// Types
interface ConversationEntry {
  speaker: string | number  // Can be 'sales_representative'/'client' or 0/1
  text: string
  start: number
  end: number
}

interface ScheduledMeeting {
  detected: boolean
  date?: string        // YYYY-MM-DD format
  time?: string        // HH:MM 24-hour format  
  duration?: number    // minutes
  type?: 'call' | 'demo' | 'meeting'
  notes?: string       // What was agreed to be discussed
}

interface AnalysisResult {
  summary: string
  keyPoints: string[]
  overallSentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  clientInterestLevel: 'high' | 'medium' | 'low'
  objections: string[]
  buyingSignals: string[]
  risks: string[]
  nextSteps: string[]
  suggestedFollowUpDate?: string
  currentStage: string
  stageConfidence: number
  scheduledMeeting?: ScheduledMeeting
  analyzedAt: string
  modelUsed: string
  processingTimeMs: number
}

interface CallData {
  callSid: string
  clientId: string
  clientName: string
  companyName: string
  industry: string
  contactEmail: string
  contactPhone: string
  salesRepName: string
  callNumber: number
  status: string
  outcome: string
  nextAction: string
  createdAt: string
  sentiment: string
  conversation: ConversationEntry[]
  analysis?: AnalysisResult
}

// Mock data for demonstration
const mockCallsData: Record<string, CallData> = {
  'MOCK_CA_CLT001_CALL001': {
    callSid: 'MOCK_CA_CLT001_CALL001',
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    callNumber: 1,
    status: 'initial_contact',
    outcome: 'interested',
    nextAction: 'scheduled_demo',
    createdAt: '2026-01-10T14:30:00.000Z',
    sentiment: 'positive',
    conversation: [
      { speaker: 'client', text: 'Hello, this is Sarah speaking.', start: 5.0, end: 6.8 },
      { speaker: 'sales_representative', text: 'Hi Sarah! This is Michael from TechFlow Solutions. How are you doing today?', start: 7.2, end: 11.5 },
      { speaker: 'client', text: "I'm doing well, thanks for asking. I received your email about your AI-powered analytics platform. I have to say, the timing is perfect because we've been struggling with our current data analysis process.", start: 12.0, end: 22.0 },
      { speaker: 'sales_representative', text: "That's great to hear, Sarah. I'd love to learn more about your current challenges. What specific issues are you facing with your data analysis?", start: 22.5, end: 29.0 },
      { speaker: 'client', text: "Well, our team spends hours manually compiling reports from different sources. By the time we get the insights, the data is often outdated. We're a marketing agency, so real-time insights are crucial for our campaigns.", start: 29.5, end: 42.0 },
    ],
  },
}

const sentimentColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  positive: 'success',
  neutral: 'default',
  negative: 'destructive',
  mixed: 'warning',
}

const interestColors: Record<string, 'success' | 'warning' | 'destructive'> = {
  high: 'success',
  medium: 'warning',
  low: 'destructive',
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [call, setCall] = useState<CallData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')
  
  // Google Calendar integration state
  const [showCalendarPrompt, setShowCalendarPrompt] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(false)
  const [calendarSuccess, setCalendarSuccess] = useState(false)
  const [calendarEventUrl, setCalendarEventUrl] = useState<string | null>(null)
  const [calendarError, setCalendarError] = useState<string | null>(null)

  // Handle adding meeting to Google Calendar
  const handleAddToCalendar = async () => {
    const scheduledMeeting = call?.analysis?.scheduledMeeting
    if (!scheduledMeeting?.detected || !scheduledMeeting.date || !scheduledMeeting.time || !call) return
    
    setCalendarLoading(true)
    setCalendarError(null)
    
    try {
      const result = await createCalendarEvent({
        clientName: call.clientName,
        meetingType: scheduledMeeting.type || 'meeting',
        date: scheduledMeeting.date,
        time: scheduledMeeting.time,
        duration: scheduledMeeting.duration || 30,
        description: scheduledMeeting.notes || `Follow-up ${scheduledMeeting.type || 'meeting'} with ${call.clientName}`,
      })
      
      if (result.needsAuth) {
        // Redirect to Google OAuth
        window.location.href = '/api/auth/google'
        return
      }
      
      if (result.success && result.event) {
        setCalendarSuccess(true)
        setCalendarEventUrl(result.event.htmlLink)
      } else {
        setCalendarError(result.error || 'Failed to create calendar event')
      }
    } catch {
      setCalendarError('Failed to create calendar event')
    } finally {
      setCalendarLoading(false)
    }
  }

  useEffect(() => {
    async function fetchCall() {
      // Check if it's a mock call first
      if (mockCallsData[id]) {
        setCall(mockCallsData[id])
        setIsLoading(false)
        return
      }

      // Try to fetch from API
      try {
        const response = await fetch(`/api/transcripts/${id}`)
        
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`API returned non-JSON response. Status: ${response.status}`);
        }
        
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Transcript not found')
        }

        const transcript = data.transcript
        setCall({
          callSid: transcript.callSid,
          clientId: transcript.clientId || 'Unknown',
          clientName: transcript.clientName || 'Unknown Client',
          companyName: transcript.companyName || 'Unknown Company',
          industry: transcript.industry || 'Unknown',
          contactEmail: transcript.contactEmail || '',
          contactPhone: transcript.contactPhone || '',
          salesRepName: transcript.salesRepName || 'Unknown',
          callNumber: transcript.callNumber || 1,
          status: transcript.status || 'completed',
          outcome: transcript.outcome || 'unknown',
          nextAction: transcript.nextAction || 'none',
          createdAt: transcript.createdAt || new Date().toISOString(),
          sentiment: transcript.sentiment || 'neutral',
          conversation: transcript.conversation || [],
          analysis: transcript.analysis || undefined,
        })
      } catch (err) {
        console.error('Error fetching call:', err)
        setError(err instanceof Error ? err.message : 'Failed to load call')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCall()
  }, [id])

  const handleAnalyze = async () => {
    if (!call) return
    
    setIsAnalyzing(true)
    setAnalyzeError(null)
    
    try {
      const response = await fetch(`/api/analyze/${call.callSid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openrouter' }), // Use OpenRouter as primary
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }
      
      // Update call with analysis
      setCall(prev => prev ? { ...prev, analysis: data.analysis } : null)
    } catch (err) {
      console.error('Error analyzing call:', err)
      setAnalyzeError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <Header 
          title="Loading..."
          description="Fetching call details"
          actions={
            <Link href="/clients">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          }
        />
        <div className="flex-1 p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !call) {
    return (
      <div className="flex flex-col h-full">
        <Header 
          title="Call Not Found"
          description="The requested call could not be found"
          actions={
            <Link href="/clients">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          }
        />
        <div className="flex-1 p-6">
          <Card>
            <CardContent className="py-16 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Call not found</h3>
              <p className="text-muted-foreground">
                {error || 'This call ID does not exist in the system.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const duration = call.conversation.length > 0 
    ? call.conversation[call.conversation.length - 1].end 
    : 0

  const analysis = call.analysis

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={`Call #${call.callNumber}`}
        description={`${call.clientName} • ${call.companyName}`}
        actions={
          <div className="flex gap-2">
            <Link href="/clients">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || call.conversation.length === 0}
              variant={analysis ? 'outline' : 'default'}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {analysis ? 'Re-analyze' : 'Analyze with AI'}
                </>
              )}
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        {analyzeError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {analyzeError}
          </div>
        )}
        
        {/* Google Calendar Integration - Only show if a meeting was detected */}
        {analysis?.scheduledMeeting?.detected && analysis.scheduledMeeting.date && analysis.scheduledMeeting.time && showCalendarPrompt && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="py-4">
              {calendarSuccess ? (
                // Success state
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-green-700">Meeting Added to Calendar</p>
                    <p className="text-xs text-green-600">
                      {analysis.scheduledMeeting.type === 'demo' ? 'Demo' : analysis.scheduledMeeting.type === 'call' ? 'Call' : 'Meeting'} with {call.clientName} scheduled
                    </p>
                  </div>
                  {calendarEventUrl && (
                    <a 
                      href={calendarEventUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View in Calendar →
                    </a>
                  )}
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowCalendarPrompt(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : calendarError ? (
                // Error state
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <X className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-red-700">Failed to Add to Calendar</p>
                    <p className="text-xs text-red-600">{calendarError}</p>
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={handleAddToCalendar}
                    disabled={calendarLoading}
                  >
                    Try Again
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowCalendarPrompt(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                // Default prompt state
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white shadow-sm border border-blue-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900">Schedule Meeting?</p>
                    <p className="text-xs text-gray-600">
                      {analysis.scheduledMeeting.type === 'demo' ? 'Demo' : analysis.scheduledMeeting.type === 'call' ? 'Call' : 'Meeting'} on{' '}
                      <span className="font-medium">{analysis.scheduledMeeting.date}</span> at{' '}
                      <span className="font-medium">{analysis.scheduledMeeting.time}</span>
                      {analysis.scheduledMeeting.duration && ` (${analysis.scheduledMeeting.duration} min)`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowCalendarPrompt(false)}
                      className="text-gray-600"
                    >
                      No Thanks
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleAddToCalendar}
                      disabled={calendarLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {calendarLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-1" />
                          Add to Calendar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Info Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={sentimentColors[call.sentiment] || 'default'}>
                    {call.sentiment}
                  </Badge>
                  <Badge variant="outline">{call.status.replace(/_/g, ' ')}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(Math.floor(duration))}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Rep: {call.salesRepName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(call.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                {call.conversation.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transcript available for this call.
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto space-y-3">
                    {call.conversation.map((entry, i) => {
                      const minutes = Math.floor(entry.start / 60)
                      const seconds = Math.floor(entry.start % 60)
                      const timestamp = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`
                      
                      // Determine speaker based on alternating pattern
                      // First person (index 0) = Client, second person (index 1) = Sales Rep
                      // Pattern: Client, Sales Rep, Client, Sales Rep...
                      // Even indices (0, 2, 4...) = Client
                      // Odd indices (1, 3, 5...) = Sales Rep
                      const isRep = i % 2 === 1
                      const speakerName = isRep 
                        ? (call.salesRepName || 'Sales Rep')
                        : (call.clientName || 'Client')
                      
                      // Check if this text contains an objection
                      const isObjection = analysis?.objections?.some(obj => 
                        entry.text.toLowerCase().includes(obj.toLowerCase().substring(0, 30))
                      )
                      
                      return (
                        <p 
                          key={i} 
                          className={cn(
                            'leading-relaxed text-black',
                            isObjection && 'bg-yellow-100 -mx-2 px-2 py-1 rounded border-l-4 border-yellow-400'
                          )}
                        >
                          <span className="text-muted-foreground">{timestamp}</span>{' '}
                          <span className="font-semibold text-black">{speakerName}:</span>{' '}
                          <span className="text-black">{entry.text}</span>
                        </p>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Analysis Panel */}
          <div className="space-y-6">
            {!analysis ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Analyze with AI" to get insights about this call.
                  </p>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || call.conversation.length === 0}>
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score Card - Enterprise Style */}
                <Card>
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                      Deal Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-semibold text-foreground">
                        {analysis.stageConfidence}%
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Confidence Score</div>
                    </div>
                    <div className="space-y-2.5 text-sm">
                      <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                        <span className="text-muted-foreground">Pipeline Stage</span>
                        <span className="font-medium capitalize">{(analysis.currentStage || 'unknown').replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                        <span className="text-muted-foreground">Interest Level</span>
                        <span className="font-medium capitalize">{analysis.clientInterestLevel || 'unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-muted-foreground">Sentiment</span>
                        <span className="font-medium capitalize">{analysis.overallSentiment || 'unknown'}</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t text-xs text-muted-foreground/70">
                      Model: {analysis.modelUsed?.split('/').pop() || 'AI'} • {analysis.processingTimeMs}ms
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader 
                    className="cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
                  >
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Summary
                      </span>
                      {expandedSection === 'summary' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CardTitle>
                  </CardHeader>
                  {expandedSection === 'summary' && (
                    <CardContent>
                      <p className="text-sm text-black">{analysis.summary}</p>
                      {analysis.keyPoints.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-medium mb-2 text-black">Key Points</div>
                          <ul className="space-y-1">
                            {analysis.keyPoints.map((point, i) => (
                              <li key={i} className="text-sm flex items-start gap-2 text-black">
                                <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-black">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Action Insights - Full Width Enterprise Section */}
        {analysis && (
          <Card className="mt-6">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Analysis & Recommendations
                </CardTitle>
                {analysis.suggestedFollowUpDate && (
                  <span className="text-xs text-muted-foreground">
                    Suggested follow-up: {analysis.suggestedFollowUpDate}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Next Steps */}
                <InsightSection
                  icon={<ArrowUpRight className="h-4 w-4" />}
                  title="Recommended Actions"
                  color="blue"
                  items={analysis.nextSteps || []}
                  emptyMessage="No specific actions identified"
                />

                {/* Buying Signals */}
                <InsightSection
                  icon={<TrendingUp className="h-4 w-4" />}
                  title="Positive Indicators"
                  color="emerald"
                  items={analysis.buyingSignals || []}
                  emptyMessage="No buying signals detected"
                />

                {/* Objections */}
                <InsightSection
                  icon={<AlertCircle className="h-4 w-4" />}
                  title="Client Concerns"
                  color="amber"
                  items={analysis.objections || []}
                  emptyMessage="No objections raised"
                />

                {/* Risks */}
                <InsightSection
                  icon={<ShieldAlert className="h-4 w-4" />}
                  title="Risk Factors"
                  color="red"
                  items={analysis.risks || []}
                  emptyMessage="No significant risks identified"
                  emptyIsPositive
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
