'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge, RiskBadge, StatusBadge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  ChevronDown, 
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Target,
  MessageSquare,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { cn, formatDuration } from '@/lib/utils'

// Mock data for a single call - will be replaced with real API data
const mockCall = {
  id: '1',
  title: 'Acme Corp Discovery Call',
  prospect: 'John Smith',
  company: 'Acme Corp',
  rep: { firstName: 'Sarah', lastName: 'Wilson', imageUrl: null },
  status: 'COMPLETED' as const,
  riskLevel: 'MEDIUM' as const,
  callDate: '2024-01-15T10:30:00',
  duration: 1845,
  summary: 'Productive discovery call with John Smith from Acme Corp. Identified key pain points around manual data entry and lack of visibility. Prospect showed interest but expressed concerns about implementation timeline.',
  nextSteps: [
    'Send product demo video',
    'Schedule follow-up call with technical team',
    'Prepare ROI calculation based on their current process',
  ],
  transcript: `[00:00] Sarah: Hi John, this is Sarah from Talkio. Thanks for taking my call today.

[00:05] John: Hi Sarah, yes I've been looking forward to this.

[00:10] Sarah: Great! So I understand you're currently looking at solutions for your sales team. Can you tell me a bit about what challenges you're facing?

[00:20] John: Sure. Our main issue is that our reps are spending too much time on manual data entry after calls. They're not capturing important details consistently.

[00:35] Sarah: I hear that a lot. How much time would you estimate they spend on post-call work?

[00:42] John: Probably 30-45 minutes per call, honestly. It's killing their productivity.

[00:50] Sarah: That's significant. And what happens with the data they do capture?

[00:58] John: It goes into our CRM, but the quality is inconsistent. Our managers can't really use it for coaching because everyone captures different things.

[01:10] Sarah: So if I'm understanding correctly, you have two main issues - the time spent on manual work, and the inconsistency of the data being captured?

[01:20] John: Exactly. We need something that can help with both.

[01:25] Sarah: That's exactly what Talkio does. We automatically analyze your calls and extract key information - objections, next steps, coaching opportunities. No manual work required.

[01:40] John: That sounds interesting. But I'm concerned about the implementation timeline. We've had bad experiences with long software rollouts.

[01:52] Sarah: That's a valid concern. Can you tell me more about those past experiences?

[02:00] John: Our last CRM implementation took 6 months and we're still dealing with adoption issues.

[02:10] Sarah: I understand. Talkio is much simpler - most customers are fully operational within 2 weeks. Would it help if I showed you exactly what the onboarding process looks like?

[02:25] John: Yes, that would be helpful.`,
  stages: [
    { name: 'Introduction', order: 1, status: 'DETECTED' as const, startTime: 0, endTime: 10 },
    { name: 'Discovery', order: 2, status: 'DETECTED' as const, startTime: 10, endTime: 80 },
    { name: 'Presentation', order: 3, status: 'DETECTED' as const, startTime: 85, endTime: 120 },
    { name: 'Objection Handling', order: 4, status: 'SKIPPED' as const, startTime: null, endTime: null },
    { name: 'Close', order: 5, status: 'INCOMPLETE' as const, startTime: null, endTime: null },
  ],
  objections: [
    {
      id: '1',
      type: 'timing',
      quote: "I'm concerned about the implementation timeline. We've had bad experiences with long software rollouts.",
      timestamp: 100,
      suggestedResponse: 'Share specific onboarding timeline and success stories from similar companies.',
      handledWell: true,
    },
  ],
  analysis: {
    overallScore: 78,
    openingScore: 85,
    discoveryScore: 90,
    presentationScore: 75,
    closingScore: 60,
    strengths: [
      'Excellent discovery questions',
      'Good active listening and paraphrasing',
      'Addressed objection directly with specifics',
    ],
    improvements: [
      'Could have asked more about decision-making process',
      'Should have attempted a stronger close',
      'Missed opportunity to discuss pricing',
    ],
    coachingTips: [
      'Practice transitioning from discovery to presentation more smoothly',
      'Always attempt to set a specific next meeting time',
    ],
  },
}

export default function CallDetailPage() {
  const [expandedObjection, setExpandedObjection] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full">
      <Header 
        title={mockCall.title}
        description={`${mockCall.prospect} • ${mockCall.company}`}
        actions={
          <div className="flex gap-2">
            <Link href="/calls">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <Button variant="outline">
              Re-analyze
            </Button>
          </div>
        }
      />
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Transcript */}
          <div className="lg:col-span-2 space-y-6">
            {/* Call Info Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <StatusBadge status={mockCall.status} />
                  <RiskBadge level={mockCall.riskLevel} />
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(mockCall.duration)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {mockCall.rep.firstName} {mockCall.rep.lastName}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Stage Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Call Stages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mockCall.stages.map((stage, index) => (
                    <div
                      key={stage.name}
                      className={cn(
                        'flex-1 min-w-[100px] p-3 rounded-lg border text-center transition-colors',
                        stage.status === 'DETECTED' && 'bg-green-50 border-green-200',
                        stage.status === 'INCOMPLETE' && 'bg-yellow-50 border-yellow-200',
                        stage.status === 'SKIPPED' && 'bg-red-50 border-red-200'
                      )}
                    >
                      <div className="text-sm font-medium">{stage.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stage.status === 'DETECTED' && stage.startTime !== null ? (
                          `${formatDuration(stage.startTime)} - ${formatDuration(stage.endTime ?? 0)}`
                        ) : (
                          stage.status.toLowerCase()
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Transcript */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Transcript</CardTitle>
                <Button variant="ghost" size="sm">
                  <Play className="h-4 w-4 mr-1" />
                  Play Audio
                </Button>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                  {mockCall.transcript.split('\n\n').map((paragraph, i) => {
                    const isObjectionQuote = mockCall.objections.some(obj => 
                      paragraph.includes(obj.quote.substring(0, 30))
                    )
                    return (
                      <p 
                        key={i} 
                        className={cn(
                          'mb-3',
                          isObjectionQuote && 'bg-yellow-100 -mx-2 px-2 py-1 rounded border-l-4 border-yellow-400'
                        )}
                      >
                        {paragraph}
                      </p>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Insights Panel */}
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Performance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-primary">
                    {mockCall.analysis.overallScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Opening', score: mockCall.analysis.openingScore },
                    { label: 'Discovery', score: mockCall.analysis.discoveryScore },
                    { label: 'Presentation', score: mockCall.analysis.presentationScore },
                    { label: 'Closing', score: mockCall.analysis.closingScore },
                  ].map(({ label, score }) => (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{label}</span>
                        <span className="font-medium">{score}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            score >= 80 ? 'bg-green-500' :
                            score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {mockCall.summary}
                </p>
              </CardContent>
            </Card>
            
            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {mockCall.nextSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            
            {/* Objections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Objections ({mockCall.objections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockCall.objections.map((objection) => (
                  <div 
                    key={objection.id}
                    className="border rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedObjection(
                        expandedObjection === objection.id ? null : objection.id
                      )}
                      className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {objection.type}
                        </Badge>
                        {objection.handledWell && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      {expandedObjection === objection.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    {expandedObjection === objection.id && (
                      <div className="px-3 pb-3 space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Quote</div>
                          <p className="text-sm italic bg-muted/50 p-2 rounded">
                            "{objection.quote}"
                          </p>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Suggested Response</div>
                          <p className="text-sm text-primary">
                            {objection.suggestedResponse}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
            
            {/* Coaching Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Coaching Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-green-600 mb-2">Strengths</div>
                    <ul className="space-y-1">
                      {mockCall.analysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-yellow-600 mb-2">Areas to Improve</div>
                    <ul className="space-y-1">
                      {mockCall.analysis.improvements.map((improvement, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-3 w-3 text-yellow-500 mt-1 flex-shrink-0" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
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
