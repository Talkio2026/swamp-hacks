'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  formatDate,
  formatDateTime,
  formatDurationVerbose,
  formatRelativeTime,
  secondsToTimestamp,
} from '@/lib/utils'
import type {
  CallDetail,
  CallDetailApiResponse,
  ContextHistoryApiResponse,
} from '@/lib/types/clients'
import { cn } from '@/lib/utils'

async function fetchCallDetail(
  clientId: string,
  callId: string
): Promise<CallDetailApiResponse> {
  const res = await fetch(`/api/clients/${clientId}/calls/${callId}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        'Failed to fetch call'
    )
  }
  return res.json()
}

async function fetchContextHistory(
  clientId: string
): Promise<ContextHistoryApiResponse> {
  const res = await fetch(`/api/clients/${clientId}/context`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        'Failed to fetch context'
    )
  }
  return res.json()
}

async function patchCallDetail(
  clientId: string,
  callId: string,
  body: {
    summary?: { bullets: string[] }
    outcome?: { explanation: string | null }
    nextAction?: { purpose?: string | null; missingReason?: string | null }
  }
): Promise<CallDetailApiResponse> {
  const res = await fetch(`/api/clients/${clientId}/calls/${callId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        'Failed to update call'
    )
  }
  return res.json()
}

async function retryAnalysis(
  clientId: string,
  callId: string
): Promise<{ ok: boolean }> {
  const res = await fetch(`/api/clients/${clientId}/calls/${callId}/retry`, {
    method: 'POST',
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(
      (err as { error?: { message?: string } })?.error?.message ??
        'Retry failed'
    )
  }
  return res.json()
}

function CallHeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-7 w-64" />
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-4 w-40" />
    </div>
  )
}

function TwoColumnSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

export default function CallDetailPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const clientId = typeof params?.clientId === 'string' ? params.clientId : ''
  const callId = typeof params?.callId === 'string' ? params.callId : ''
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [highlightSegmentT, setHighlightSegmentT] = useState<number | null>(null)

  const {
    data: callData,
    isLoading: callLoading,
    isPending: callPending,
    isError: callError,
    refetch: refetchCall,
  } = useQuery({
    queryKey: ['call-detail', clientId, callId],
    queryFn: () => fetchCallDetail(clientId, callId),
    enabled: !!clientId && !!callId,
  })

  const { data: contextData } = useQuery({
    queryKey: ['client-context', clientId],
    queryFn: () => fetchContextHistory(clientId),
    enabled: !!clientId,
  })

  const patchMutation = useMutation({
    mutationFn: (body: Parameters<typeof patchCallDetail>[2]) =>
      patchCallDetail(clientId, callId, body),
    onSuccess: (data) => {
      queryClient.setQueryData(['call-detail', clientId, callId], data)
    },
  })

  const retryMutation = useMutation({
    mutationFn: () => retryAnalysis(clientId, callId),
    onSuccess: () => {
      refetchCall()
    },
  })

  const call = callData?.call
  const allHistory = contextData?.history ?? []
  const history = allHistory.filter((h) => h.id !== callId)
  const busy = callLoading || callPending
  const canEdit = call && call.status === 'READY'
  const isProcessing = call?.status === 'PROCESSING'
  const isFailed = call?.status === 'FAILED'

  const [editingSummary, setEditingSummary] = useState(false)
  const [summaryDraft, setSummaryDraft] = useState<string[]>([])
  const [editingOutcome, setEditingOutcome] = useState(false)
  const [outcomeDraft, setOutcomeDraft] = useState('')
  const [editingNextAction, setEditingNextAction] = useState(false)
  const [nextActionDraft, setNextActionDraft] = useState('')

  const scrollToSegment = useCallback((timestampSeconds: number) => {
    const el = transcriptRef.current
    if (!el) return
    const segments = Array.from(el.querySelectorAll<HTMLElement>('[data-t]'))
    const withT = segments.map((s) => ({
      el: s,
      t: parseInt(s.getAttribute('data-t') ?? '0', 10),
    }))
    if (withT.length === 0) return
    const closest = withT.reduce((a, b) =>
      Math.abs(a.t - timestampSeconds) <= Math.abs(b.t - timestampSeconds)
        ? a
        : b
    )
    setHighlightSegmentT(closest.t)
    closest.el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setTimeout(() => setHighlightSegmentT(null), 2000)
  }, [])

  // Determine if a transcript segment is important
  const isImportantSegment = useCallback((seg: { t: number; speaker: string; text: string }) => {
    if (!call) return false
    
    // Check if this segment is a key point
    const isKeyPoint = call.keyPoints.some(kp => 
      Math.abs(kp.timestampSeconds - seg.t) < 5
    )
    if (isKeyPoint) return true

    // Check for important keywords
    const importantKeywords = [
      'schedule', 'scheduled', 'demo', 'pricing', 'price', 'cost', 'next', 
      'follow-up', 'follow up', 'decision', 'approve', 'contract', 'agreement',
      'interested', 'concern', 'objection', 'deadline', 'timeline', 'proposal',
      'meeting', 'call', 'discuss', 'review', 'sign', 'commit', 'budget'
    ]
    const lowerText = seg.text.toLowerCase()
    const hasKeyword = importantKeywords.some(keyword => lowerText.includes(keyword))
    
    // Also highlight if it's from the rep and contains actionable information
    const isRepImportant = seg.speaker === 'REP' && (
      lowerText.includes('send') || 
      lowerText.includes('prepare') || 
      lowerText.includes('will') ||
      lowerText.includes('can') ||
      lowerText.includes('should')
    )

    return hasKeyword || isRepImportant
  }, [call])

  const clientLine = call?.client?.accountName
    ? `${call.client.name} — ${call.client.accountName}`
    : call?.client?.name ?? ''
  const repLine = call?.rep?.name
    ? `Rep: ${call.rep.name} • ${formatDate(call.startedAt)} • ${formatDurationVerbose(call.durationSeconds)}`
    : `Rep: — • ${call ? formatDate(call.startedAt) : ''} • ${call ? formatDurationVerbose(call.durationSeconds) : ''}`

  const handleSaveSummary = () => {
    const bullets = summaryDraft.map((s) => s.trim()).filter(Boolean)
    if (bullets.length === 0) return
    patchMutation.mutate(
      { summary: { bullets } },
      {
        onSuccess: () => {
          setEditingSummary(false)
          setSummaryDraft([])
        },
      }
    )
  }

  const handleSaveOutcome = () => {
    patchMutation.mutate(
      { outcome: { explanation: outcomeDraft.trim() || null } },
      {
        onSuccess: () => {
          setEditingOutcome(false)
          setOutcomeDraft('')
        },
      }
    )
  }

  const handleSaveNextAction = () => {
    const { followUpStatus } = call!.nextAction
    const body =
      followUpStatus === 'SCHEDULED'
        ? { nextAction: { purpose: nextActionDraft.trim() || null } }
        : followUpStatus === 'MISSING'
          ? { nextAction: { missingReason: nextActionDraft.trim() || null } }
          : {}
    patchMutation.mutate(body as Parameters<typeof patchCallDetail>[2], {
      onSuccess: () => {
        setEditingNextAction(false)
        setNextActionDraft('')
      },
    })
  }

  const startEditSummary = () => {
    if (!call) return
    setSummaryDraft(call.summary.bullets.length ? [...call.summary.bullets] : [''])
    setEditingSummary(true)
  }

  const startEditOutcome = () => {
    setOutcomeDraft(call!.outcome.explanation ?? '')
    setEditingOutcome(true)
  }

  const startEditNextAction = () => {
    const { followUpStatus, purpose, missingReason } = call!.nextAction
    setNextActionDraft(
      followUpStatus === 'SCHEDULED' ? (purpose ?? '') : followUpStatus === 'MISSING' ? (missingReason ?? '') : ''
    )
    setEditingNextAction(true)
  }

  // Calculate deal score color based on percentage (0-100)
  // Returns a color from red (0%) through orange/yellow (50%) to green (100%)
  // Uses HSL for smoother color transitions
  const getDealScoreColor = (percentage: number): string => {
    const clamped = Math.max(0, Math.min(100, percentage))
    // HSL: Hue goes from 0 (red) to 120 (green)
    // Saturation: 100% for vibrant colors
    // Lightness: 50% for good visibility
    const hue = (clamped / 100) * 120 // 0 (red) to 120 (green)
    return `hsl(${hue}, 70%, 45%)`
  }

  // Calculate deal score based on call outcome and other factors
  // This is a placeholder - in production, this would come from the API
  const calculateDealScore = (): number => {
    if (!call) return 50
    
    let score = 50 // Base score
    
    // Adjust based on outcome label
    const outcomeLower = call.outcome.label.toLowerCase()
    if (outcomeLower.includes('won') || outcomeLower.includes('closed') || outcomeLower.includes('accepted')) {
      score += 40
    } else if (outcomeLower.includes('interested') || outcomeLower.includes('demo') || outcomeLower.includes('scheduled')) {
      score += 25
    } else if (outcomeLower.includes('follow') || outcomeLower.includes('next')) {
      score += 15
    } else if (outcomeLower.includes('rejected') || outcomeLower.includes('lost') || outcomeLower.includes('declined')) {
      score -= 30
    }
    
    // Adjust based on follow-up status
    if (call.nextAction.followUpStatus === 'SCHEDULED') {
      score += 10
    } else if (call.nextAction.followUpStatus === 'MISSING') {
      score -= 10
    }
    
    return Math.max(0, Math.min(100, score))
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={
          <>
            <Link
              href="/clients"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Clients
            </Link>
            {' > '}
            <Link
              href={`/clients/${clientId}`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {call?.client?.name ?? (clientId ? '…' : '')}
            </Link>
            {' > '}
            <Link
              href={`/clients/${clientId}/calls`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Calls
            </Link>
          </>
        }
        description={undefined}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Call header */}
        <section>
          {busy && !call ? (
            <CallHeaderSkeleton />
          ) : call ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {call.title}
                </h2>
                <p className="text-muted-foreground text-sm">{clientLine}</p>
                <p className="text-muted-foreground text-sm">{repLine}</p>
              </div>
              {/* Tags with varying shades */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Status-based tags */}
                {call.status === 'READY' && (
                  <Badge variant="success" className="bg-green-500/10 text-green-700 border-green-300/50">
                    Completed
                  </Badge>
                )}
                {call.status === 'PROCESSING' && (
                  <Badge variant="warning" className="bg-orange-500/10 text-orange-700 border-orange-300/50">
                    Processing
                  </Badge>
                )}
                {call.status === 'FAILED' && (
                  <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-300/50">
                    Failed
                  </Badge>
                )}
                
                {/* Outcome-based tags */}
                {call.outcome.label && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-300/50">
                    {call.outcome.label}
                  </Badge>
                )}
                
                {/* Call type tags - determine based on title and outcome */}
                {call.title.toLowerCase().includes('initial') || call.title.toLowerCase().includes('intro') || call.title.toLowerCase().includes('first') ? (
                  <Badge variant="default" className="bg-purple-500/10 text-purple-700 border-purple-300/50">
                    Initial Contact
                  </Badge>
                ) : call.title.toLowerCase().includes('demo') ? (
                  <Badge variant="default" className="bg-cyan-500/10 text-cyan-700 border-cyan-300/50">
                    Demo
                  </Badge>
                ) : call.title.toLowerCase().includes('follow') || call.title.toLowerCase().includes('follow-up') ? (
                  <Badge variant="default" className="bg-pink-500/10 text-pink-700 border-pink-300/50">
                    Follow-up
                  </Badge>
                ) : null}
                
                {/* Sentiment tag - placeholder (would need to be added to CallDetail type) */}
                <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-300/50">
                  Sentiment: neutral
                </Badge>
                
                {/* First contact tag if it's the first call */}
                {call.title.toLowerCase().includes('first') || call.title.toLowerCase().includes('initial') ? (
                  <Badge variant="secondary" className="bg-teal-500/10 text-teal-700 border-teal-300/50">
                    First Contact
                  </Badge>
                ) : null}
              </div>
            </div>
          ) : callError ? (
            <p className="text-muted-foreground">Call not found.</p>
          ) : null}
        </section>

        {callError && !call ? (
          <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border bg-card">
            <p className="text-muted-foreground font-medium">Failed to load call.</p>
            <Link
              href={`/clients/${clientId}/calls`}
              className="mt-2 text-sm text-primary hover:underline"
            >
              Back to calls
            </Link>
          </div>
        ) : busy && !call ? (
          <TwoColumnSkeleton />
        ) : call ? (
          <>
            {isFailed && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Analysis failed for this call.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => retryMutation.mutate()}
                    disabled={retryMutation.isPending}
                  >
                    {retryMutation.isPending ? 'Retrying…' : 'Retry'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* LEFT: Call content */}
              <div className="space-y-6">
                {/* Call summary */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-violet-50">
                    <CardTitle className="text-base">Call Summary</CardTitle>
                    {canEdit && !editingSummary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={startEditSummary}
                      >
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isProcessing ? (
                      <p className="text-sm text-muted-foreground">
                        Analysis in progress.
                      </p>
                    ) : editingSummary ? (
                      <div className="space-y-3">
                        {summaryDraft.map((line, i) => (
                          <div key={i} className="flex gap-2">
                            <Textarea
                              value={line}
                              onChange={(e) => {
                                const next = [...summaryDraft]
                                next[i] = e.target.value
                                setSummaryDraft(next)
                              }}
                              className="min-h-[60px]"
                              placeholder="Bullet point…"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="shrink-0"
                              onClick={() => {
                                const next = summaryDraft.filter((_, j) => j !== i)
                                setSummaryDraft(next.length ? next : [''])
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              setSummaryDraft([...summaryDraft, ''])
                            }
                          >
                            Add bullet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingSummary(false)
                              setSummaryDraft([])
                            }}
                            disabled={patchMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveSummary}
                            disabled={
                              patchMutation.isPending ||
                              !summaryDraft.some((s) => s.trim())
                            }
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {call.summary.bullets.length
                          ? call.summary.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))
                          : 'No summary yet.'}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                {/* Key discussion points */}
                {!isProcessing && call.keyPoints.length > 0 && (
                  <Card>
                    <CardHeader className="bg-violet-50">
                      <CardTitle className="text-base">
                        Key Discussion Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {call.keyPoints.map((kp, i) => (
                          <li key={i}>
                            <button
                              type="button"
                              className="text-left text-sm font-medium hover:underline flex items-center gap-2"
                              onClick={() =>
                                scrollToSegment(kp.timestampSeconds)
                              }
                            >
                              <span className="text-muted-foreground font-normal">
                                {secondsToTimestamp(kp.timestampSeconds)}
                              </span>
                              {kp.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Transcript */}
                <Card>
                  <CardHeader className="bg-violet-50">
                    <CardTitle className="text-base">Transcript</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {!call.transcript.available ? (
                      <p className="text-sm text-muted-foreground">
                        {isProcessing
                          ? 'Loading…'
                          : 'Not available yet.'}
                      </p>
                    ) : (
                      <ScrollArea
                        ref={transcriptRef}
                        className="h-[280px] rounded-md border p-3"
                      >
                        <div className="space-y-2">
                          {call.transcript.segments.map((seg, i) => {
                            const isImportant = isImportantSegment(seg)
                            const isHighlighted = highlightSegmentT === seg.t
                            return (
                              <div
                                key={i}
                                data-t={String(seg.t)}
                                className={cn(
                                  'rounded px-2 py-1 transition-colors',
                                  isHighlighted && 'bg-primary/10 ring-2 ring-primary/20',
                                  isImportant && !isHighlighted && 'bg-yellow-50 border-l-4 border-yellow-400'
                                )}
                              >
                                <span className="text-xs text-muted-foreground font-medium">
                                  {secondsToTimestamp(seg.t)} · {seg.speaker}
                                  {isImportant && (
                                    <span className="ml-2 text-yellow-600 text-[10px]">⭐</span>
                                  )}
                                </span>
                                <p className={cn(
                                  'text-sm mt-0.5',
                                  isImportant && 'font-medium text-gray-900'
                                )}>
                                  {seg.text}
                                </p>
                              </div>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>

                {/* Recording */}
                {call.recording.available && call.recording.url && (
                  <Card>
                    <CardHeader className="bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
                      <CardTitle className="text-base">Recording</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <audio
                        controls
                        className="w-full"
                        src={call.recording.url}
                        preload="metadata"
                      >
                        Your browser does not support audio.
                      </audio>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* RIGHT: AI outputs & actions */}
              <div className="space-y-6">
                {isProcessing ? (
                  <Card>
                    <CardContent className="py-6">
                      <p className="text-sm text-muted-foreground text-center">
                        Analysis in progress.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Next action */}
                    <Card
                      className={cn(
                        call.nextAction.followUpStatus === 'MISSING' &&
                          'border-l-4 border-l-destructive/50'
                      )}
                    >
                      <CardHeader className="bg-violet-50">
                        <CardTitle className="text-base">
                          Next Action
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-2">
                        {call.nextAction.followUpStatus === 'SCHEDULED' && (
                          <>
                            <p className="text-sm font-medium">
                              {call.nextAction.scheduledAt
                                ? formatDateTime(
                                    call.nextAction.scheduledAt
                                  )
                                : 'Follow-up scheduled'}
                            </p>
                            {call.nextAction.scheduledAt && (
                              <p className="text-sm text-muted-foreground">
                                {formatRelativeTime(
                                  call.nextAction.scheduledAt
                                )}
                              </p>
                            )}
                            {editingNextAction ? (
                              <div className="space-y-2 pt-2">
                                <Textarea
                                  value={nextActionDraft}
                                  onChange={(e) =>
                                    setNextActionDraft(e.target.value)
                                  }
                                  placeholder="Purpose…"
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveNextAction}
                                    disabled={patchMutation.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingNextAction(false)
                                      setNextActionDraft('')
                                    }}
                                    disabled={patchMutation.isPending}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  {call.nextAction.purpose ?? '—'}
                                </p>
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={startEditNextAction}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {call.nextAction.followUpStatus === 'MISSING' && (
                          <>
                            <p className="text-sm font-medium text-muted-foreground">
                              No follow-up scheduled
                            </p>
                            {editingNextAction ? (
                              <div className="space-y-2 pt-2">
                                <Textarea
                                  value={nextActionDraft}
                                  onChange={(e) =>
                                    setNextActionDraft(e.target.value)
                                  }
                                  placeholder="Reason…"
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={handleSaveNextAction}
                                    disabled={patchMutation.isPending}
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingNextAction(false)
                                      setNextActionDraft('')
                                    }}
                                    disabled={patchMutation.isPending}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  {call.nextAction.missingReason ?? '—'}
                                </p>
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs"
                                    onClick={startEditNextAction}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </>
                            )}
                          </>
                        )}
                        {call.nextAction.followUpStatus === 'NONE' && (
                          <p className="text-sm text-muted-foreground">
                            No follow-up required
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Deal Score */}
                    <Card>
                      <CardHeader className="bg-violet-50">
                        <CardTitle className="text-base">Deal Score</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {isProcessing ? (
                          <p className="text-sm text-muted-foreground">
                            Analysis in progress.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-center">
                              <div
                                className="text-5xl font-bold mb-2 transition-colors"
                                style={{ color: getDealScoreColor(calculateDealScore()) }}
                              >
                                {calculateDealScore()}%
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Deal Probability
                              </p>
                            </div>
                            {/* Progress bar with gradient */}
                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${calculateDealScore()}%`,
                                  background: `linear-gradient(to right, hsl(0, 70%, 45%), hsl(${(calculateDealScore() / 100) * 120}, 70%, 45%))`,
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Low</span>
                              <span>High</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Call outcome */}
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-violet-50">
                        <CardTitle className="text-base">Call Outcome</CardTitle>
                        {canEdit && !editingOutcome && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={startEditOutcome}
                          >
                            Edit
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm font-medium">{call.outcome.label}</p>
                        {editingOutcome ? (
                          <div className="space-y-2 pt-2">
                            <Textarea
                              value={outcomeDraft}
                              onChange={(e) =>
                                setOutcomeDraft(e.target.value)
                              }
                              placeholder="Explanation…"
                              className="min-h-[80px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveOutcome}
                                disabled={patchMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingOutcome(false)
                                  setOutcomeDraft('')
                                }}
                                disabled={patchMutation.isPending}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {call.outcome.explanation ?? '—'}
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Context history */}
                    <Card>
                      <CardHeader className="bg-gradient-to-b from-violet-50 via-violet-50/80 to-transparent">
                        <CardTitle className="text-base">
                          Context History
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {history.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No previous calls.
                          </p>
                        ) : (
                          <ul className="space-y-3">
                            {history.map((h) => (
                              <li key={h.id}>
                                <Link
                                  href={`/clients/${clientId}/calls/${h.id}`}
                                  className="block rounded-md border p-3 text-sm transition-colors hover:bg-muted/50"
                                >
                                  <span className="font-medium">
                                    {formatDate(h.date)} · {h.title}
                                  </span>
                                  <p className="text-muted-foreground mt-1 line-clamp-2">
                                    {h.oneLineSummary}
                                  </p>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
