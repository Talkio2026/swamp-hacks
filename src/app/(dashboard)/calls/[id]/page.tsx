'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Building2,
  User,
  Phone,
  Mail,
  Calendar,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Loader2,
  Sparkles,
  Brain,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { formatDuration } from '@/lib/utils'

// Analysis result type
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
  analyzedAt: string
  modelUsed: string
  processingTimeMs: number
}

// Type for call data
interface CallData {
  clientId: string
  clientName: string
  companyName: string
  industry: string
  contactEmail: string
  contactPhone: string
  salesRepName: string
  callNumber: number
  callSid: string
  status: string
  outcome: string
  nextAction: string
  createdAt: string
  sentiment: string
  conversation: Array<{
    speaker: string
    text: string
    start: number
    end: number
  }>
}

// Mock call data for demonstration
const mockCallsData: Record<string, CallData> = {
  'MOCK_CA_CLT001_CALL001': {
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    callNumber: 1,
    callSid: 'MOCK_CA_CLT001_CALL001',
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
  'MOCK_CA_CLT001_CALL002': {
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    callNumber: 2,
    callSid: 'MOCK_CA_CLT001_CALL002',
    status: 'demo',
    outcome: 'very_interested',
    nextAction: 'contract_review',
    createdAt: '2026-01-14T10:00:00.000Z',
    sentiment: 'positive',
    conversation: [
      { speaker: 'sales_representative', text: 'Hi Sarah! Great to connect again. Ready for the demo today?', start: 5.0, end: 9.0 },
      { speaker: 'client', text: "Absolutely! I've been looking forward to this. I also brought my colleague James who handles our technical integrations.", start: 9.5, end: 16.0 },
      { speaker: 'sales_representative', text: 'Perfect! Welcome James. Let me share my screen and walk you through our platform.', start: 16.5, end: 22.0 },
    ],
  },
  'MOCK_CA_CLT001_CALL003': {
    clientId: 'CLT_001',
    clientName: 'Sarah Chen',
    companyName: 'Bright Ideas Marketing',
    industry: 'Marketing',
    contactEmail: 'sarah@brightideasmarketing.com',
    contactPhone: '+15551001001',
    salesRepName: 'Michael',
    callNumber: 3,
    callSid: 'MOCK_CA_CLT001_CALL003',
    status: 'contract_accepted',
    outcome: 'closed_won',
    nextAction: 'implementation_kickoff',
    createdAt: '2026-01-17T15:00:00.000Z',
    sentiment: 'positive',
    conversation: [
      { speaker: 'sales_representative', text: 'Hi Sarah! Great news - I received the signed contract this morning.', start: 5.0, end: 10.0 },
      { speaker: 'client', text: "Yes! We're all very excited to get started. The team has been asking when we can begin the implementation.", start: 10.5, end: 17.0 },
    ],
  },
  'MOCK_CA_CLT002_CALL001': {
    clientId: 'CLT_002',
    clientName: 'David Martinez',
    companyName: 'Genesis Tech Solutions',
    industry: 'Technology',
    contactEmail: 'd.martinez@genesistech.com',
    contactPhone: '+15551002002',
    salesRepName: 'Jessica',
    callNumber: 1,
    callSid: 'MOCK_CA_CLT002_CALL001',
    status: 'initial_contact',
    outcome: 'hesitant_interest',
    nextAction: 'scheduled_followup',
    createdAt: '2026-01-08T10:15:00.000Z',
    sentiment: 'neutral',
    conversation: [
      { speaker: 'client', text: 'Hello, David Martinez speaking.', start: 5.0, end: 7.0 },
      { speaker: 'sales_representative', text: 'Hi David, this is Jessica from TechFlow Solutions. Do you have a few minutes to discuss how we might help Genesis Tech with your analytics needs?', start: 7.5, end: 15.0 },
      { speaker: 'client', text: "I suppose I can spare a few minutes, but I should tell you upfront - we're currently locked into a contract with another vendor.", start: 15.5, end: 23.0 },
    ],
  },
  'MOCK_CA_CLT002_CALL002': {
    clientId: 'CLT_002',
    clientName: 'David Martinez',
    companyName: 'Genesis Tech Solutions',
    industry: 'Technology',
    contactEmail: 'd.martinez@genesistech.com',
    contactPhone: '+15551002002',
    salesRepName: 'Jessica',
    callNumber: 2,
    callSid: 'MOCK_CA_CLT002_CALL002',
    status: 'rejected',
    outcome: 'closed_lost',
    nextAction: 'none',
    createdAt: '2026-01-12T14:00:00.000Z',
    sentiment: 'negative',
    conversation: [
      { speaker: 'sales_representative', text: 'Hi David, Jessica here from TechFlow. How are you today?', start: 5.0, end: 9.0 },
      { speaker: 'client', text: "Hi Jessica. Look, I'll be honest with you - I've discussed this with my team and we've decided to stick with our current solution for now.", start: 9.5, end: 18.0 },
    ],
  },
  'MOCK_CA_CLT003_CALL001': {
    clientId: 'CLT_003',
    clientName: 'Lisa Wong',
    companyName: 'Nexus Retail Solutions',
    industry: 'Retail',
    contactEmail: 'lisa@nexusretail.com',
    contactPhone: '+15551003003',
    salesRepName: 'Kevin',
    callNumber: 1,
    callSid: 'MOCK_CA_CLT003_CALL001',
    status: 'initial_contact',
    outcome: 'interested',
    nextAction: 'scheduled_demo',
    createdAt: '2026-01-15T11:00:00.000Z',
    sentiment: 'positive',
    conversation: [
      { speaker: 'client', text: 'Hi, Lisa Wong here.', start: 5.0, end: 6.5 },
      { speaker: 'sales_representative', text: "Hi Lisa! This is Kevin from TechFlow Solutions. Thanks for taking my call. I understand you're looking to improve your retail analytics capabilities?", start: 7.0, end: 15.0 },
      { speaker: 'client', text: "Yes, that's right. We've been growing rapidly and our current systems just can't keep up with the data volume.", start: 15.5, end: 23.0 },
    ],
  },
  'MOCK_CA_CLT003_CALL002': {
    clientId: 'CLT_003',
    clientName: 'Lisa Wong',
    companyName: 'Nexus Retail Solutions',
    industry: 'Retail',
    contactEmail: 'lisa@nexusretail.com',
    contactPhone: '+15551003003',
    salesRepName: 'Kevin',
    callNumber: 2,
    callSid: 'MOCK_CA_CLT003_CALL002',
    status: 'in_progress',
    outcome: 'pending_decision',
    nextAction: 'awaiting_cfo_approval',
    createdAt: '2026-01-20T11:00:00.000Z',
    sentiment: 'positive',
    conversation: [
      { speaker: 'sales_representative', text: 'Hi Lisa! Kevin here. How did the demo go with your team?', start: 5.0, end: 9.0 },
      { speaker: 'client', text: 'It went really well, Kevin! Everyone was impressed with the platform. We just need to get final approval from our CFO.', start: 9.5, end: 17.0 },
    ],
  },
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  initial_contact: 'default',
  demo: 'warning',
  in_progress: 'warning',
  contract_accepted: 'success',
  rejected: 'destructive',
  followup: 'default',
  completed: 'success',
}

const outcomeColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  interested: 'success',
  very_interested: 'success',
  hesitant_interest: 'warning',
  pending_decision: 'warning',
  closed_won: 'success',
  closed_lost: 'destructive',
  unknown: 'default',
}

const sentimentColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  positive: 'success',
  neutral: 'default',
  negative: 'destructive',
  mixed: 'warning',
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
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
  
  // Analysis state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true)
  const [userModelPreference, setUserModelPreference] = useState<{
    provider: 'gemini' | 'openrouter'
    model?: string
    displayName?: string
  }>({ provider: 'gemini', displayName: 'Gemini' })

  // Fetch user's saved model preference
  const fetchUserSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      
      if (data.settings?.aiModel) {
        const aiModel = data.settings.aiModel
        const availableModels = data.availableModels || []
        
        // Find the display name for the model
        let displayName = 'Gemini'
        if (aiModel.provider === 'openrouter' && aiModel.openRouterModel) {
          const modelInfo = availableModels.find((m: { id: string }) => m.id === aiModel.openRouterModel)
          displayName = modelInfo?.name || aiModel.openRouterModel
        }
        
        setUserModelPreference({
          provider: aiModel.provider,
          model: aiModel.openRouterModel,
          displayName,
        })
      }
    } catch (err) {
      console.error('Error fetching user settings:', err)
    }
  }

  // Fetch existing analysis
  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/analyze/${id}`)
      const data = await response.json()
      if (data.hasAnalysis) {
        setAnalysis(data.analysis)
      }
    } catch (err) {
      console.error('Error fetching analysis:', err)
    }
  }

  // Run AI analysis using user's saved preference
  const runAnalysis = async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch(`/api/analyze/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider: userModelPreference.provider,
          model: userModelPreference.model,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }
      
      setAnalysis(data.analysis)
    } catch (err) {
      console.error('Error running analysis:', err)
      setAnalysisError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
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
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Transcript not found')
        }

        // Transform API response to CallData format
        const transcript = data.transcript
        setCall({
          clientId: transcript.clientId || 'Unknown',
          clientName: transcript.clientName || 'Unknown Client',
          companyName: transcript.companyName || 'Unknown Company',
          industry: transcript.industry || 'Unknown',
          contactEmail: transcript.contactEmail || '',
          contactPhone: transcript.contactPhone || '',
          salesRepName: transcript.salesRepName || 'Unknown',
          callNumber: transcript.callNumber || 1,
          callSid: transcript.callSid,
          status: transcript.status || 'completed',
          outcome: transcript.outcome || 'unknown',
          nextAction: transcript.nextAction || 'none',
          createdAt: transcript.createdAt || new Date().toISOString(),
          sentiment: transcript.sentiment || 'neutral',
          conversation: transcript.conversation || [],
        })
      } catch (err) {
        console.error('Error fetching call:', err)
        setError(err instanceof Error ? err.message : 'Failed to load call')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCall()
    fetchAnalysis()
    fetchUserSettings()
  }, [id])

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
                Back to Clients
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
                Back to Clients
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

  // Calculate call duration from conversation
  const duration = call.conversation.length > 0 
    ? call.conversation[call.conversation.length - 1].end 
    : 0

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={`Call #${call.callNumber}`}
        description={`${call.clientName} • ${call.companyName}`}
        actions={
          <Link href="/clients">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tags/Badges Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant={statusColors[call.status] || 'default'}>
                    {formatStatus(call.status)}
                  </Badge>
                  <Badge variant={outcomeColors[call.outcome] || 'default'}>
                    {formatStatus(call.outcome)}
                  </Badge>
                  <Badge variant={sentimentColors[call.sentiment] || 'default'}>
                    Sentiment: {call.sentiment}
                  </Badge>
                  {call.status === 'initial_contact' && (
                    <Badge variant="outline">First Contact</Badge>
                  )}
                  {call.outcome === 'closed_won' && (
                    <Badge variant="success">Deal Won</Badge>
                  )}
                  {call.outcome === 'closed_lost' && (
                    <Badge variant="destructive">Deal Lost</Badge>
                  )}
                  {call.outcome === 'very_interested' && (
                    <Badge variant="success">High Interest</Badge>
                  )}
                  {call.outcome === 'hesitant_interest' && (
                    <Badge variant="warning">Low Interest</Badge>
                  )}
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
                  <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto space-y-3">
                    {call.conversation.map((entry, i) => {
                      const minutes = Math.floor(entry.start / 60)
                      const seconds = Math.floor(entry.start % 60)
                      const timestamp = `[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}]`
                      const speakerName = entry.speaker === 'sales_representative' ? call.salesRepName : call.clientName
                      
                      return (
                        <p key={i} className="leading-relaxed">
                          <span className="text-muted-foreground">{timestamp}</span>{' '}
                          <span className="font-semibold">{speakerName}:</span>{' '}
                          {entry.text}
                        </p>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Panel */}
            <Card>
              <CardHeader className="cursor-pointer" onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Insights
                    {analysis && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {analysis.modelUsed}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!analysis && !isAnalyzing && (
                      <Badge variant="outline" className="text-xs">
                        Using: {userModelPreference.displayName}
                      </Badge>
                    )}
                    {analysis ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          runAnalysis()
                        }}
                        disabled={isAnalyzing}
                        className="h-7 px-2"
                      >
                        <RefreshCw className={`h-3 w-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          runAnalysis()
                        }}
                        disabled={isAnalyzing}
                        className="h-7"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="h-3 w-3 mr-1" />
                            Analyze
                          </>
                        )}
                      </Button>
                    )}
                    {isAnalysisExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {isAnalysisExpanded && (
                <CardContent className="space-y-4">
                  {analysisError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                      {analysisError}
                    </div>
                  )}
                  
                  {isAnalyzing && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-purple-500" />
                        <p className="text-sm text-muted-foreground">Analyzing transcript...</p>
                      </div>
                    </div>
                  )}
                  
                  {!analysis && !isAnalyzing && !analysisError && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Click &quot;Analyze&quot; to get AI-powered insights</p>
                      <p className="text-xs mt-1">
                        Using <span className="font-medium">{userModelPreference.displayName}</span> • 
                        <Link href="/settings" className="text-primary hover:underline ml-1">Change in Settings</Link>
                      </p>
                    </div>
                  )}
                  
                  {analysis && !isAnalyzing && (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div>
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Summary
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {analysis.summary}
                        </p>
                      </div>
                      
                      {/* Interest & Sentiment */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Client Interest</p>
                          <Badge variant={
                            analysis.clientInterestLevel === 'high' ? 'success' :
                            analysis.clientInterestLevel === 'medium' ? 'warning' : 'destructive'
                          }>
                            {(analysis.clientInterestLevel || 'unknown').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Stage Confidence</p>
                          <p className="text-lg font-semibold">{analysis.stageConfidence}%</p>
                        </div>
                      </div>
                      
                      {/* Key Points */}
                      {analysis.keyPoints.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Key Points
                          </h4>
                          <ul className="text-sm space-y-1">
                            {analysis.keyPoints.map((point, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Buying Signals */}
                      {analysis.buyingSignals.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            Buying Signals
                          </h4>
                          <ul className="text-sm space-y-1">
                            {analysis.buyingSignals.map((signal, i) => (
                              <li key={i} className="flex items-start gap-2 text-green-600/80">
                                <span>+</span>
                                <span>{signal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Objections */}
                      {analysis.objections.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            Objections Raised
                          </h4>
                          <ul className="text-sm space-y-1">
                            {analysis.objections.map((obj, i) => (
                              <li key={i} className="flex items-start gap-2 text-yellow-600/80">
                                <span>!</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Risks */}
                      {analysis.risks.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            Risks
                          </h4>
                          <ul className="text-sm space-y-1">
                            {analysis.risks.map((risk, i) => (
                              <li key={i} className="flex items-start gap-2 text-red-600/80">
                                <span>⚠</span>
                                <span>{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Next Steps */}
                      {analysis.nextSteps.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Recommended Next Steps
                          </h4>
                          <ol className="text-sm space-y-1 list-decimal list-inside">
                            {analysis.nextSteps.map((step, i) => (
                              <li key={i} className="text-muted-foreground">{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                      
                      {/* Follow-up Date */}
                      {analysis.suggestedFollowUpDate && (
                        <div className="flex items-center gap-2 text-sm bg-primary/5 p-3 rounded-lg">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">Suggested Follow-up:</span>
                          <span className="text-muted-foreground">{analysis.suggestedFollowUpDate}</span>
                        </div>
                      )}
                      
                      {/* Metadata */}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        Analyzed in {analysis.processingTimeMs}ms • {new Date(analysis.analyzedAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
          
          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Call Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Call Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(call.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Sales Rep</p>
                    <p className="text-sm text-muted-foreground">{call.salesRepName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">{formatDuration(Math.floor(duration))}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{call.clientName}</p>
                    <p className="text-sm text-muted-foreground">{call.clientId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{call.companyName}</p>
                    <p className="text-sm text-muted-foreground">{call.industry}</p>
                  </div>
                </div>
                {call.contactEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{call.contactEmail}</p>
                  </div>
                )}
                {call.contactPhone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{call.contactPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Action */}
            {call.nextAction && call.nextAction !== 'none' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Next Action
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-sm">
                    {formatStatus(call.nextAction)}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
